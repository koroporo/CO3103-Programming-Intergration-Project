const crypto = require("crypto");

const PASSWORD_HASH_KEY_LENGTH = 64;
const PASSWORD_HASH_PREFIX = "scrypt";
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 30;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, PASSWORD_HASH_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`${PASSWORD_HASH_PREFIX}$${salt.toString("hex")}$${derivedKey.toString("hex")}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  const [prefix, saltHex, hash] = storedHash.split("$");

  if (
    prefix !== PASSWORD_HASH_PREFIX ||
    !/^[a-f0-9]{32}$/i.test(saltHex) ||
    !/^[a-f0-9]{128}$/i.test(hash)
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(saltHex, "hex"), PASSWORD_HASH_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey));
    });
  });
}

function createResetToken() {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
}

function getResetTokenExpiry() {
  return new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

module.exports = {
  createResetToken,
  getResetTokenExpiry,
  hashPassword,
  normalizeEmail,
  verifyPassword,
};
