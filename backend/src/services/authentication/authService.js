
const crypto = require("crypto");
const accountModels = require("../../models/Authentication/accountModels");
const { generateToken } = require("./tokenService");
const {isValidEmail, normalizeEmail, isValidPassword,} = require("../../utils/authValidators");
const { hashPassword, verifyPassword } = require("../../utils/passwordUtils");


const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 30;

// LOGIN
async function login(email, password) {
  const normalizedEmail = normalizeEmail(email);

  // Find the account
  const user = await accountModels.findByEmail(normalizedEmail);

  if (!user) {
    return null;
  }

  // Verify password using crypto.scrypt
  const isMatch = await verifyPassword(password, user.password_hash);

  if (!isMatch || user.status !== "active") {
    return null;
  }

  // Generate token after successful login
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
}

// REGISTER
async function register({ email, password, fullName }) {
  if (
    typeof email !== "string" ||
    typeof fullName !== "string" ||
    !isValidEmail(email) ||
    fullName.trim().length < 1 ||
    fullName.trim().length > 150 ||
    !isValidPassword(password)
  ) {
    const error = new Error(
      "A valid email, full name, and password of at least 8 characters are required"
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  const trimmedName = fullName.trim();
  const passwordHash = await hashPassword(password);

  const row = await accountModels.createAccount({
    email: normalizedEmail,
    passwordHash,
    fullName: trimmedName,
  });

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
  };
}



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
  login,
  register,
  createResetToken,
  getResetTokenExpiry,
  publicAccount,
};
