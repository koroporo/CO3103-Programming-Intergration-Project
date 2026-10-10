const express = require("express");
const crypto = require("crypto");
const pool = require("./db");
const {
  createResetToken,
  getResetTokenExpiry,
  hashPassword,
  normalizeEmail,
} = require("./auth");

const app = express();
app.use(express.json());

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function publicAccount(account) {
  return {
    id: account.id,
    email: account.email,
    full_name: account.full_name,
    role: account.role,
    status: account.status,
    created_at: account.created_at,
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed", error);
    res.status(503).json({ status: "error" });
  }
});

app.post("/accounts/register", async (req, res) => {
  const { email, password, full_name: fullName } = req.body;

  if (
    typeof email !== "string" ||
    typeof fullName !== "string" ||
    !isValidEmail(email) ||
    fullName.trim().length < 1 ||
    fullName.trim().length > 150 ||
    !isValidPassword(password)
  ) {
    res.status(400).json({
      error: "A valid email, full name, and password of at least 8 characters are required",
    });
    return;
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO accounts (email, password_hash, full_name, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'user', 'active', NOW(), NOW())
       RETURNING id, email, full_name, role, status, created_at`,
      [normalizedEmail, passwordHash, fullName.trim()],
    );

    res.status(201).json({ account: publicAccount(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    console.error("Account registration failed", error);
    res.status(500).json({ error: "Failed to register account" });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  const genericResponse = {
    message: "If an account exists for that email, a password reset link has been sent",
  };
  const { email } = req.body;

  if (typeof email !== "string" || !isValidEmail(email)) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }

  try {
    const accountResult = await pool.query(
      "SELECT id FROM accounts WHERE email = $1 AND status = 'active'",
      [normalizeEmail(email)],
    );

    if (accountResult.rowCount === 0) {
      res.json(genericResponse);
      return;
    }

    const { token, tokenHash } = createResetToken();
    const expiry = getResetTokenExpiry();

    await pool.query(
      `UPDATE auth_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1 AND purpose = 'password_reset' AND consumed_at IS NULL AND revoked_at IS NULL`,
      [accountResult.rows[0].id],
    );
    await pool.query(
      `INSERT INTO auth_tokens (user_id, token_hash, purpose, created_at, expires_at)
       VALUES ($1, $2, 'password_reset', NOW(), $3)`,
      [accountResult.rows[0].id, tokenHash, expiry],
    );

    if (process.env.RESET_TOKEN_DEBUG === "true") {
      res.json({ ...genericResponse, resetToken: token });
      return;
    }

    res.json(genericResponse);
  } catch (error) {
    console.error("Password reset request failed", error);
    res.status(500).json({ error: "Failed to request password reset" });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (
    typeof token !== "string" ||
    token.length !== 64 ||
    !/^[a-f0-9]+$/i.test(token) ||
    !isValidPassword(password)
  ) {
    res.status(400).json({
      error: "A valid reset token and password of at least 8 characters are required",
    });
    return;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const tokenResult = await client.query(
      `SELECT id, user_id
       FROM auth_tokens
       WHERE token_hash = $1
         AND purpose = 'password_reset'
         AND consumed_at IS NULL
         AND revoked_at IS NULL
         AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash],
    );

    if (tokenResult.rowCount === 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const userId = tokenResult.rows[0].user_id;

    const accountUpdate = await client.query(
      "UPDATE accounts SET password_hash = $1, updated_at = NOW() WHERE id = $2 AND status = 'active'",
      [passwordHash, userId],
    );
    if (accountUpdate.rowCount === 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "Account is not available" });
      return;
    }
    await client.query(
      "UPDATE auth_tokens SET consumed_at = NOW() WHERE id = $1",
      [tokenResult.rows[0].id],
    );
    await client.query(
      `UPDATE auth_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1 AND purpose = 'password_reset' AND consumed_at IS NULL AND revoked_at IS NULL`,
      [userId],
    );
    await client.query("COMMIT");

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Password reset failed", error);
    res.status(500).json({ error: "Failed to reset password" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.get("/accounts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, role, status, avatar_url, bio, created_at, updated_at FROM accounts ORDER BY id",
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get accounts" });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
