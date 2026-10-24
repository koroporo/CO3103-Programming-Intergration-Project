// services/Authentication/passwordResetService.js

const crypto = require("crypto");
const pool = require("../../db"); // Adjust to your actual database module.

const passwordResetModel = require("../../models/Authentication/passwordResetModels");
const { sendPasswordResetEmail } = require("../email/emailService");

// Adjust these paths and exported names to match your existing helpers.
const {
  createResetToken,
  getResetTokenExpiry,
} = require("../../utils/resetPassword");

const {
  isValidPassword,
  isValidEmail,
  normalizeEmail,
} = require("../../utils/authValidators");
const { hashPassword } = require("../../utils/passwordUtils");

const GENERIC_RESPONSE = {
  message:
    "If an account exists for that email, a password reset link has been sent",
};

// Request a password-reset token.
async function requestPasswordResetService(email) {
  if (typeof email !== "string" || !isValidEmail(email)) {
    const error = new Error("A valid email is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  const account =
    await passwordResetModel.findActiveAccountByEmail(normalizedEmail);

  // Do not reveal whether an email is registered.
  if (!account) {
    return GENERIC_RESPONSE;
  }

  const { token, tokenHash } = createResetToken();
  const expiry = getResetTokenExpiry();

  await passwordResetModel.createPasswordResetToken(
    account.id,
    tokenHash,
    expiry,
  );

  // Development only. Never enable this in production.
  if (process.env.RESET_TOKEN_DEBUG === "true") {
    return { ...GENERIC_RESPONSE, resetToken: token };
  }

  // TODO: Send an email containing the reset link.
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await sendPasswordResetEmail(normalizedEmail, resetLink);
  return GENERIC_RESPONSE;
}

// Reset the account password using a valid token.
async function resetPasswordService(token, password) {
  if (
    typeof token !== "string" ||
    token.length !== 64 ||
    !/^[a-f0-9]+$/i.test(token) ||
    !isValidPassword(password)
  ) {
    const error = new Error(
      "A valid reset token and password of at least 8 characters are required",
    );
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resetToken = await passwordResetModel.findValidResetToken(
      tokenHash,
      client,
    );

    if (!resetToken) {
      const error = new Error("Invalid or expired reset token");
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await hashPassword(password);

    const updated = await passwordResetModel.updateAccountPassword(
      resetToken.user_id,
      passwordHash,
      client,
    );

    if (!updated) {
      const error = new Error("Account is not available");
      error.statusCode = 400;
      throw error;
    }

    await passwordResetModel.consumeResetToken(resetToken.id, client);

    await passwordResetModel.revokeOtherResetTokens(resetToken.user_id, client);

    await client.query("COMMIT");

    return { message: "Password has been reset successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  requestPasswordResetService,
  resetPasswordService,
};
