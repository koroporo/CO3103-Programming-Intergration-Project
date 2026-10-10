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

