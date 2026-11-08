const pool = require("../../db");

async function listByRecipient(recipientId) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE recipient_id = $1
     ORDER BY created_at DESC, id DESC`,
    [recipientId]
  );
  return rows;
}

async function insert(data) {
  const { rows } = await pool.query(
    `INSERT INTO notifications
       (recipient_id, notification_type, title, body, dedupe_key,
        course_id, lesson_id, assessment_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (recipient_id, dedupe_key) DO NOTHING
     RETURNING *`,
    [
      data.recipient_id, data.notification_type, data.title, data.body,
      data.dedupe_key, data.course_id, data.lesson_id, data.assessment_id
    ]
  );
  return rows[0];
}

module.exports = { listByRecipient, insert };
