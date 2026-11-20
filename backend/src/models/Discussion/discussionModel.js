const pool = require("../../db");

async function withTransaction(work) {
  const client = await pool.connect();
  let releaseError;
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try { await client.query("ROLLBACK"); }
    catch (rollbackError) { releaseError = rollbackError; }
    throw error;
  } finally {
    client.release(releaseError);
  }
}

async function findActor(client, id) {
  const { rows } = await client.query(
    "SELECT id, role, status, full_name FROM accounts WHERE id = $1 FOR SHARE", [id]);
  return rows[0];
}

async function findLesson(client, id) {
  const { rows } = await client.query(`
    SELECT l.id, l.title, l.status, c.id AS course_id,
      c.instructor_id, c.status AS course_status
    FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id WHERE l.id = $1
    FOR SHARE OF l, c`, [id]);
  return rows[0];
}

async function findEnrollment(client, learnerId, courseId) {
  const { rows } = await client.query(`
    SELECT status FROM enrollments WHERE learner_id = $1 AND course_id = $2 FOR SHARE`,
  [learnerId, courseId]);
  return rows[0];
}

const projection = `d.*, CASE WHEN a.status = 'deleted' THEN 'Former member'
  ELSE a.full_name END AS author_name, a.role AS author_role`;

async function listThreads(client, lessonId, { limit, offset }) {
  const { rows } = await client.query(`
    SELECT ${projection},
      (SELECT COUNT(*)::int FROM discussions r WHERE r.parent_id = d.id
        AND r.lesson_id = d.lesson_id AND r.status = 'visible') AS reply_count
    FROM discussions d JOIN accounts a ON a.id = d.author_id
    WHERE d.lesson_id = $1 AND d.parent_id IS NULL AND d.status = 'visible'
    ORDER BY d.is_pinned DESC, d.created_at DESC, d.id DESC LIMIT $2 OFFSET $3`,
  [lessonId, limit + 1, offset]);
  return rows;
}

async function findPost(client, lessonId, id, lock = false) {
  const { rows } = await client.query(`
    SELECT ${projection} FROM discussions d JOIN accounts a ON a.id = d.author_id
    WHERE d.lesson_id = $1 AND d.id = $2 AND d.status = 'visible'
    ${lock ? "FOR UPDATE OF d" : ""}`, [lessonId, id]);
  return rows[0];
}

async function listReplies(client, lessonId, parentId, { limit, offset }) {
  const { rows } = await client.query(`
    SELECT ${projection} FROM discussions d JOIN accounts a ON a.id = d.author_id
    WHERE d.lesson_id = $1 AND d.parent_id = $2 AND d.status = 'visible'
    ORDER BY d.created_at, d.id LIMIT $3 OFFSET $4`, [lessonId, parentId, limit + 1, offset]);
  return rows;
}

async function insert(client, lessonId, authorId, parentId, content) {
  const { rows } = await client.query(`
    INSERT INTO discussions (lesson_id, author_id, parent_id, content,
      is_resolved, is_pinned, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, FALSE, FALSE, 'visible', NOW(), NOW()) RETURNING *`,
  [lessonId, authorId, parentId, content]);
  return rows[0];
}

async function update(client, id, patch) {
  // Column names come exclusively from patchBody's fixed allowlist.
  const fields = Object.keys(patch);
  const { rows } = await client.query(`UPDATE discussions SET
    ${fields.map((field, index) => `${field} = $${index + 2}`).join(", ")}, updated_at = NOW()
    WHERE id = $1 RETURNING *`, [id, ...fields.map((field) => patch[field])]);
  return rows[0];
}

async function softDelete(client, id) {
  await client.query(`UPDATE discussions SET status = 'deleted', updated_at = NOW()
    WHERE (id = $1 OR parent_id = $1) AND status <> 'deleted'`, [id]);
}

async function notify(client, lesson, actor, post, root) {
  // A new topic notifies its instructor. Replies notify the topic's participants
  // and instructor, excluding the sender and people who no longer have access.
  await client.query(`
    INSERT INTO notifications (recipient_id, notification_type, course_id, lesson_id,
      title, body, dedupe_key, created_at)
    SELECT a.id, 'new_content', $1, $2, $3, $4, $5, NOW() FROM accounts a
    WHERE a.id <> $6 AND a.status = 'active'
      AND (a.id = $7 OR ($8::bigint IS NOT NULL AND EXISTS (
        SELECT 1 FROM discussions d WHERE (d.id = $8 OR d.parent_id = $8)
          AND d.author_id = a.id AND d.status = 'visible' AND d.lesson_id = $2)))
      AND (a.role = 'admin' OR (a.role = 'instructor' AND a.id = $7)
        OR (a.role = 'learner' AND EXISTS (SELECT 1 FROM enrollments e
          WHERE e.learner_id = a.id AND e.course_id = $1 AND e.status IN ('active', 'completed'))))
    ON CONFLICT (recipient_id, dedupe_key) DO NOTHING`,
  [lesson.course_id, lesson.id,
    `${root ? "New discussion reply" : "New lesson discussion"}: ${lesson.title}`.slice(0, 250),
    `${actor.full_name}: ${post.content}`,
    `discussion:${post.id}:thread:${root?.id || post.id}`, actor.id, lesson.instructor_id, root?.id || null]);
}

module.exports = { withTransaction, findActor, findLesson, findEnrollment, listThreads,
  findPost, listReplies, insert, update, softDelete, notify };
