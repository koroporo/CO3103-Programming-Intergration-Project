// ==================== EMAIL & PASSWORD VALIDATION ====================

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}



module.exports = {
  normalizeEmail,
  isValidEmail,
  isValidPassword
}