const pool = require("../../db");

async function findCourseById(courseId) {
  const result = await pool.query(
    "SELECT id, status FROM courses WHERE id = $1",
    [courseId]
  );
  return result.rows[0];
}

async function findEnrollment(learnerId, courseId) {
  const result = await pool.query(
    "SELECT id, learner_id, course_id, status FROM enrollments WHERE learner_id = $1 AND course_id = $2",
    [learnerId, courseId]
  );
  return result.rows[0];
}

async function findReviewByEnrollmentId(enrollmentId) {
  const result = await pool.query(
    "SELECT id FROM course_reviews WHERE enrollment_id = $1",
    [enrollmentId]
  );
  return result.rows[0];
}

async function listVisibleByCourseId(courseId) {
  const sql = `
    SELECT
      cr.id::text AS id,
      a.full_name AS reviewer,
      cr.star_rating::int AS rating,
      cr.star_rating::int AS star_rating,
      cr.perceived_difficulty,
      cr.comment,
      cr.created_at AS time,
      cr.created_at,
      cr.updated_at
    FROM course_reviews cr
    JOIN enrollments e ON e.id = cr.enrollment_id
    JOIN accounts a ON a.id = e.learner_id
    WHERE e.course_id = $1 AND cr.status = 'visible'
    ORDER BY cr.created_at DESC, cr.id DESC
  `;
  const result = await pool.query(sql, [courseId]);
  return result.rows;
}

async function getCourseReviewStats(courseId) {
  const sql = `
    SELECT
      COUNT(cr.id)::int AS total_reviews,
      COALESCE(ROUND(AVG(cr.star_rating)::numeric, 1), 0)::float AS average_rating
    FROM course_reviews cr
    JOIN enrollments e ON e.id = cr.enrollment_id
    WHERE e.course_id = $1 AND cr.status = 'visible'
  `;
  const result = await pool.query(sql, [courseId]);
  return result.rows[0];
}

async function createReview({ enrollmentId, starRating, perceivedDifficulty, comment }) {
  const sql = `
    WITH inserted AS (
      INSERT INTO course_reviews (
        enrollment_id,
        star_rating,
        perceived_difficulty,
        comment,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, 'visible', NOW(), NOW())
      RETURNING *
    )
    SELECT
      i.id::text AS id,
      a.full_name AS reviewer,
      i.star_rating::int AS rating,
      i.star_rating::int AS star_rating,
      i.perceived_difficulty,
      i.comment,
      i.created_at AS time,
      i.created_at,
      i.updated_at
    FROM inserted i
    JOIN enrollments e ON e.id = i.enrollment_id
    JOIN accounts a ON a.id = e.learner_id
  `;
  const values = [enrollmentId, starRating, perceivedDifficulty, comment];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

module.exports = {
  findCourseById,
  findEnrollment,
  findReviewByEnrollmentId,
  listVisibleByCourseId,
  getCourseReviewStats,
  createReview,
};