const accountModel = require("../../models/Authentication/accountModels");
const { generateToken } = require("./tokenService");
const { hashPassword, verifyPassword } = require("../../utils/passwordUtils");
const {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} = require("../../utils/authValidators");

async function login(email, password) {
  if (typeof email !== "string" || typeof password !== "string" || !password) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await accountModel.findByEmail(normalizedEmail);

  if (!user || user.status !== "active") {
    return null;
  }

  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    return null;
  }

  return {
    token: generateToken(user),
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
}

async function register({ email, password, fullName }) {
  if (
    typeof email !== "string" ||
    !isValidEmail(email.trim()) ||
    !isValidPassword(password) ||
    typeof fullName !== "string" ||
    !fullName.trim()
  ) {
    const error = new Error("A valid email, name, and password of at least 8 characters are required");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const passwordHash = await hashPassword(password);
  return accountModel.createAccount({
    email: normalizeEmail(email),
    passwordHash,
    fullName: fullName.trim(),
  });
}

async function getCurrentUser(accountId) {
  const user = await accountModel.findUserById(accountId);
  if (!user) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

module.exports = {
  login,
  register,
  getCurrentUser,
};
