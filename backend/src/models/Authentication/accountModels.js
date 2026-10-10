const pool = require("../../db");

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash, full_name, role, status
     FROM accounts
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
}

module.exports = {
  findByEmail
};