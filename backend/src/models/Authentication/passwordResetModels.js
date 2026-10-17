// models/Authentication/passwordResetModel.js

const pool = require("../../db"); // Adjust to your actual database module.

// Find an active account by email.
async function findActiveAccountByEmail(email) {
  const result = await pool.query(
    `SELECT id
     FROM accounts
     WHERE email = $1 AND status = 'active'`,
    [email],
  );

  return result.rows[0] ?? null;
}

// Revoke previous tokens and insert the new token in one transaction.
async function createPasswordResetToken(userId, tokenHash, expiry) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE auth_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND purpose = 'password_reset'
         AND consumed_at IS NULL
         AND revoked_at IS NULL`,
      [userId],
    );

    await client.query(
      `INSERT INTO auth_tokens
       (user_id, token_hash, purpose, created_at, expires_at)
       VALUES ($1, $2, 'password_reset', NOW(), $3)`,
      [userId, tokenHash, expiry],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Find a valid token and lock its row for the reset transaction.
async function findValidResetToken(tokenHash, client) {
  const result = await client.query(
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

  return result.rows[0] ?? null;
}

// Update the account's password.
async function updateAccountPassword(userId, passwordHash, client) {
  const result = await client.query(
    `UPDATE accounts
     SET password_hash = $1, updated_at = NOW()
     WHERE id = $2 AND status = 'active'`,
    [passwordHash, userId],
  );

  return result.rowCount > 0;
}

// Mark the used token as consumed.
async function consumeResetToken(tokenId, client) {
  await client.query(
    `UPDATE auth_tokens
     SET consumed_at = NOW()
     WHERE id = $1`,
    [tokenId],
  );
}

// Revoke all other outstanding reset tokens.
async function revokeOtherResetTokens(userId, client) {
  await client.query(
    `UPDATE auth_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND purpose = 'password_reset'
       AND consumed_at IS NULL
       AND revoked_at IS NULL`,
    [userId],
  );
}

module.exports = {
  findActiveAccountByEmail,
  createPasswordResetToken,
  findValidResetToken,
  updateAccountPassword,
  consumeResetToken,
  revokeOtherResetTokens,
};