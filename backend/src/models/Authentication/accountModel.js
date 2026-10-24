const pool = require("../db");

async function findById(id) {
  // chỉ đọc những trường middleware cần để kiểm tra quyền
  const sql = "SELECT id, role, status FROM accounts WHERE id = $1";
  const values = [id];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

module.exports = { findById };
