const pool = require("../../db");

// LOG IN
async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash, full_name, role, status
     FROM accounts
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return result.rows[0] || null;
}

// REGISTER
async function createAccount({ email, passwordHash, fullName }) {
  const result = await pool.query(
    `INSERT INTO accounts
       (email, password_hash, full_name, status,
        created_at, updated_at)
     VALUES ($1, $2, $3, 'active', NOW(), NOW())
     RETURNING *;`,
    [email, passwordHash, fullName],
  );

  return result.rows[0];
}

// GET USER_DATA
async function findUserById(accountId) {
    const query = `
        SELECT
            a.id,
            a.email,
            a.full_name,
            a.role,
            a.status,
            a.avatar_url,
            a.bio,
            a.target_overall_band,
            a.target_exam_date,
            a.created_at,
            a.updated_at,
            ud.sex,
            ud.phone_number,
            ud.birthday,
            ud.school,
            ud.target_skill,
            ud.target_level
        FROM accounts AS a
        LEFT JOIN user_data AS ud
            ON a.id = ud.account_id
        WHERE a.id = $1
    `;

    const result = await pool.query(query, [accountId]);

    return result.rows[0] || null;
}

async function findById(id) {
  // chỉ đọc những trường middleware cần để kiểm tra quyền
  const sql = "SELECT id, role, status FROM accounts WHERE id = $1";
  const values = [id];

  const result = await pool.query(sql, values);
  return result.rows[0];
}
module.exports = {
  findByEmail,
  createAccount,
  findUserById,
  findById,
};
