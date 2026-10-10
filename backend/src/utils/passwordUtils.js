function hashPassword(password) {
  const salt = crypto.randomBytes(16);

  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      PASSWORD_HASH_KEY_LENGTH,
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(
          `${PASSWORD_HASH_PREFIX}$${salt.toString("hex")}$${derivedKey.toString("hex")}`
        );
      }
    );
  });
}
function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string") {
    return Promise.resolve(false);
  }

  const [prefix, saltHex, hash] = storedHash.split("$");

  if (
    prefix !== PASSWORD_HASH_PREFIX ||
    !/^[a-f0-9]{32}$/i.test(saltHex || "") ||
    !/^[a-f0-9]{128}$/i.test(hash || "")
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      Buffer.from(saltHex, "hex"),
      PASSWORD_HASH_KEY_LENGTH,
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(
          crypto.timingSafeEqual(
            Buffer.from(hash, "hex"),
            derivedKey
          )
        );
      }
    );
  });
}




module.exports = {
    hashPassword,
    verifyPassword
};
