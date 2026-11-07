const pool = require("../../db");

async function findEligibleEnrollment(courseId, learnerId) {
  const sql = `
    SELECT id, status
    FROM enrollments
    WHERE course_id = $1
      AND learner_id = $2
      AND status IN ('active', 'completed')
    LIMIT 1
  `;

  const result = await pool.query(sql, [courseId, learnerId]);

  return result.rows[0] ?? null;
}

async function findOpenReport(courseId, reporterId) {
  const sql = `
    SELECT id, status
    FROM content_reports
    WHERE course_id = $1
      AND reporter_id = $2
      AND status IN ('pending', 'reviewing')
    LIMIT 1
  `;

  const result = await pool.query(sql, [courseId, reporterId]);

  return result.rows[0] ?? null;
}

async function createReport(courseId, reporterId, reason) {
  const sql = `
    INSERT INTO content_reports (
      reporter_id,
      course_id,
      reason,
      status,
      created_at
    )
    VALUES ($1, $2, $3, 'pending', NOW())
    RETURNING *
  `;

  const result = await pool.query(sql, [
    reporterId,
    courseId,
    reason,
  ]);

  return result.rows[0];
}

async function findCourseById(courseId) {
  const sql = `
    SELECT id, instructor_id
    FROM courses
    WHERE id = $1
  `;

  const result = await pool.query(sql, [courseId]);

  return result.rows[0] ?? null;
}

async function listReports({ courseId, reporterId, status, limit, offset }) {
  const sql = `
    SELECT id, reporter_id, course_id, reason, status, created_at, resolved_at
    FROM content_reports
    WHERE course_id = $1
      AND ($2::bigint IS NULL OR reporter_id = $2::bigint)
      AND ($3::varchar IS NULL OR status = $3::varchar)
    ORDER BY created_at DESC, id DESC
    LIMIT $4 OFFSET $5
  `;

  const result = await pool.query(sql, [
    courseId, reporterId, status, limit + 1, offset,
  ]);

  return result.rows;
}

module.exports = {
  findEligibleEnrollment,
  findOpenReport,
  createReport,
  findCourseById,
  listReports,
};
