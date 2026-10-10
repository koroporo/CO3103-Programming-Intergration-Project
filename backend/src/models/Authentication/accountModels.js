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
async function createAccount({ email, passwordHash, fullName }) {
  const result = await pool.query(
    `INSERT INTO accounts
       (email, password_hash, full_name, role, status,
        created_at, updated_at)
     VALUES ($1, $2, $3, 'user', 'active', NOW(), NOW())
     RETURNING id, email, full_name, role, status, created_at`,
    [email, passwordHash, fullName]
  );

  return result.rows[0];
}


module.exports = {
  findByEmail,
  createAccount
};