// ==================== PASSWORD RESET ====================

function createResetToken() {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
}

function getResetTokenExpiry() {
  return new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

// ==================== PUBLIC ACCOUNT ====================

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
module.exports = {
  createResetToken,
  getResetTokenExpiry,
  publicAccount,
};