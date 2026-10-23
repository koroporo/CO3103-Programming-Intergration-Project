const pool = require("../db");

async function withTransaction(runQueries) {
  const client = await pool.connect();
  let releaseError;
  try {
    await client.query("BEGIN");
    const result = await runQueries(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      releaseError = rollbackError;
    }
    throw error;
  } finally {
    client.release(releaseError);
  }
}

async function lockLearner(client, learnerId) {
  const sql = "SELECT id, role, status FROM accounts WHERE id = $1 FOR UPDATE";
  const values = [learnerId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function findByCourse(client, learnerId, courseId) {
  const sql = `
    SELECT * FROM enrollments WHERE learner_id = $1 AND course_id = $2 FOR UPDATE
  `;
  const values = [learnerId, courseId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function lockOwnedEnrollment(client, id, learnerId) {
  const sql = `
    SELECT * FROM enrollments WHERE id = $1 AND learner_id = $2 FOR UPDATE
  `;
  const values = [id, learnerId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function lockCourse(client, courseId) {
  const sql = "SELECT id, status FROM courses WHERE id = $1 FOR SHARE";
  const values = [courseId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function findMissingPrerequisites(client, learnerId, courseId) {
  const sql = `
    SELECT prerequisite_course_id FROM course_prerequisites AS prerequisites
    WHERE course_id = $1 AND NOT EXISTS (
      SELECT 1 FROM enrollments
      WHERE learner_id = $2
        AND course_id = prerequisites.prerequisite_course_id
        AND status = 'completed'
    )
    ORDER BY prerequisite_course_id
  `;
  const values = [courseId, learnerId];

  const result = await client.query(sql, values);
  return result.rows;
}

async function createEnrollment(client, learnerId, courseId) {
  const sql = `
    INSERT INTO enrollments (learner_id, course_id, status, enrolled_at)
    VALUES ($1, $2, 'active', NOW()) RETURNING *
  `;
  const values = [learnerId, courseId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function reactivateEnrollment(client, id) {
  const sql = `
    UPDATE enrollments SET status = 'active', withdrawn_at = NULL, completed_at = NULL
    WHERE id = $1 RETURNING *
  `;
  const values = [id];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function withdrawEnrollment(client, id) {
  const sql = `
    UPDATE enrollments SET status = 'withdrawn', withdrawn_at = NOW()
    WHERE id = $1 RETURNING *
  `;
  const values = [id];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function findPublishedLesson(client, lessonId, courseId) {
  const sql = `
    SELECT lessons.id FROM lessons
    JOIN chapters ON chapters.id = lessons.chapter_id
    WHERE lessons.id = $1 AND chapters.course_id = $2 AND lessons.status = 'published'
    FOR SHARE OF lessons, chapters
  `;
  const values = [lessonId, courseId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function updateResume(client, id, lessonId) {
  const sql = `
    UPDATE enrollments SET resume_lesson_id = $2, last_accessed_at = NOW()
    WHERE id = $1 RETURNING *
  `;
  const values = [id, lessonId];

  const result = await client.query(sql, values);
  return result.rows[0];
}

async function createAudit(client, actor, action, before, after) {
  let beforeData = null;
  if (before) {
    beforeData = JSON.stringify(before);
  }
  const afterData = JSON.stringify(after);

  const sql = `
    INSERT INTO audit_logs (
      actor_id, actor_role_snapshot, action, entity_type, entity_id,
      before_data, after_data, created_at
    ) VALUES ($1, $2, $3, 'enrollment', $4, $5::jsonb, $6::jsonb, NOW())
  `;
  const values = [
    actor.id,       // $1: ai thực hiện?
    actor.role,     // $2: role tại lúc thực hiện
    action,        // $3: thao tác gì?
    after.id,      // $4: enrollment nào
    beforeData,    // $5: dữ liệu trước khi sửa (null nếu tạo mới)
    afterData      // $6: dữ liệu sau khi sửa
  ];

  await client.query(sql, values);
}

async function listByLearner(learnerId, filters) {
  const sql = `
    SELECT enrollments.*, json_build_object(
      'id', courses.id::text, 'title', courses.title, 'slug', courses.slug,
      'thumbnail_url', courses.thumbnail_url, 'status', courses.status
    ) AS course
    FROM enrollments JOIN courses ON courses.id = enrollments.course_id
    WHERE learner_id = $1 AND ($2::varchar IS NULL OR enrollments.status = $2)
    ORDER BY enrolled_at DESC, enrollments.id DESC LIMIT $3 OFFSET $4
  `;
  const values = [learnerId, filters.status, filters.limit + 1, filters.offset];

  const result = await pool.query(sql, values);
  return result.rows;
}

async function findOwnedById(id, learnerId) {
  const sql = `
    SELECT enrollments.*, json_build_object(
      'id', courses.id::text, 'title', courses.title, 'slug', courses.slug,
      'thumbnail_url', courses.thumbnail_url, 'status', courses.status
    ) AS course
    FROM enrollments JOIN courses ON courses.id = enrollments.course_id
    WHERE enrollments.id = $1 AND learner_id = $2
  `;
  const values = [id, learnerId];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

module.exports = {
  withTransaction,
  lockLearner,
  findByCourse,
  lockOwnedEnrollment,
  lockCourse,
  findMissingPrerequisites,
  createEnrollment,
  reactivateEnrollment,
  withdrawEnrollment,
  findPublishedLesson,
  updateResume,
  createAudit,
  listByLearner,
  findOwnedById
};
