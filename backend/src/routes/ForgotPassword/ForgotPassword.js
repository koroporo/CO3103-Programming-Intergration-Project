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