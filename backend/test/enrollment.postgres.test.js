const { describe, test, before, beforeEach, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { Pool } = require("pg");
const pool = require("../src/db");
const service = require("../src/services/enrollmentService");

// Chỉ chạy khi chủ động cung cấp DB test. Mỗi lần chạy dùng schema riêng.
const connectionString = process.env.TEST_DATABASE_URL;
describe("enrollment on PostgreSQL", { skip: !connectionString }, () => {
  const schema = `enrollment_test_${randomUUID().replaceAll("-", "")}`;
  const learner = { id: "10", role: "learner" };
  const otherLearner = { id: "11", role: "learner" };
  let admin;
  let database;
  let schemaCreated = false;

  before(async () => {
    admin = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
    await admin.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    database = new Pool({ connectionString, options: `-c search_path=${schema}`, connectionTimeoutMillis: 5000 });
    const sql = await readFile(path.join(__dirname, "../../database/init.sql"), "utf8");
    await database.query(sql);
    mock.method(pool, "query", (...args) => database.query(...args));
    mock.method(pool, "connect", (...args) => database.connect(...args));
  });

  beforeEach(async () => {
    await database.query(`
      TRUNCATE accounts, categories CASCADE;
      INSERT INTO accounts (id, email, password_hash, full_name, role, status, created_at, updated_at)
      VALUES (10, 'learner@example.test', 'test-only', 'Learner', 'learner', 'active', NOW(), NOW()),
        (11, 'other@example.test', 'test-only', 'Other learner', 'learner', 'active', NOW(), NOW()),
        (12, 'instructor@example.test', 'test-only', 'Instructor', 'instructor', 'active', NOW(), NOW());
      INSERT INTO categories (id, name, slug) VALUES (1, 'Test', 'test');
      INSERT INTO courses (id, instructor_id, category_id, title, slug, description, status, is_featured, created_at, updated_at)
      VALUES (20, 12, 1, 'Course', 'course', 'Test course', 'published', FALSE, NOW(), NOW()),
        (21, 12, 1, 'Prerequisite', 'prerequisite', 'Test prerequisite', 'published', FALSE, NOW(), NOW()),
        (22, 12, 1, 'Draft', 'draft', 'Test draft', 'draft', FALSE, NOW(), NOW());
      INSERT INTO chapters (id, course_id, title, position) VALUES (30, 20, 'Chapter', 1), (31, 21, 'Other', 1);
      INSERT INTO lessons (id, chapter_id, title, position, is_required, required_watch_percentage, status, created_at, updated_at)
      VALUES (40, 30, 'Lesson', 1, TRUE, 80, 'published', NOW(), NOW()),
        (41, 31, 'Other lesson', 1, TRUE, 80, 'published', NOW(), NOW());
      INSERT INTO videos (id, lesson_id, video_url, duration_seconds, created_at)
      VALUES (60, 40, 'test/video.mp4', 100, NOW()), (61, 41, 'test/other.mp4', 100, NOW());
      INSERT INTO lesson_materials (id, lesson_id, title, material_type, text_content, is_required, position)
      VALUES (70, 40, 'Notes', 'text', 'Test notes', TRUE, 1);
    `);
  });

  after(async () => {
    mock.restoreAll();
    if (database) await database.end();
    if (schemaCreated) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    if (admin) await admin.end();
    await pool.end();
  });

  test("concurrent enrollment requests create exactly one enrollment and one audit", async () => {
    const results = await Promise.all(Array.from({ length: 6 }, () => service.enroll({ course_id: "20" }, learner)));
    assert.equal(results.filter((result) => result.created).length, 1);
    assert.equal(new Set(results.map((result) => result.enrollment.id)).size, 1);
    assert.equal((await database.query("SELECT * FROM enrollments")).rowCount, 1);
    const audits = await database.query("SELECT * FROM audit_logs");
    assert.equal(audits.rowCount, 1);
    assert.equal(audits.rows[0].action, "enroll_course");
    assert.equal(audits.rows[0].before_data, null);
    assert.equal(audits.rows[0].after_data.learner_id, "10");
  });

  test("withdraw and concurrent reenrollment preserve all saved progress", async () => {
    const { enrollment } = await service.enroll({ course_id: "20" }, learner);
    await service.resume(enrollment.id, { lesson_id: "40" }, learner);
    await database.query(`
      INSERT INTO lesson_progress (enrollment_id, lesson_id, status, started_at, last_accessed_at)
      VALUES ($1, 40, 'in_progress', NOW(), NOW())
    `, [enrollment.id]);
    await database.query(`
      INSERT INTO video_progress (enrollment_id, video_id, last_position_seconds, updated_at)
      VALUES ($1, 60, 35, NOW())
    `, [enrollment.id]);
    await database.query(`
      INSERT INTO material_progress (enrollment_id, material_id, completed_at, updated_at)
      VALUES ($1, 70, NOW(), NOW())
    `, [enrollment.id]);
    await database.query(`
      INSERT INTO video_watch_segments (enrollment_id, video_id, start_second, end_second, recorded_at)
      VALUES ($1, 60, 0, 35, NOW())
    `, [enrollment.id]);
    const tables = ["lesson_progress", "video_progress", "material_progress", "video_watch_segments"];
    const snapshots = await Promise.all(tables.map(async (table) => (await database.query(`SELECT * FROM ${table}`)).rows));
    await service.withdraw(enrollment.id, learner);
    const results = await Promise.all(Array.from({ length: 4 }, () => service.enroll({ course_id: "20" }, learner)));
    assert.equal(results.filter((result) => result.reactivated).length, 1);
    const restored = await service.getById(enrollment.id, learner);
    assert.equal(restored.status, "active");
    assert.equal(restored.resume_lesson_id, "40");
    assert.deepEqual(restored.enrolled_at, enrollment.enrolled_at);
    assert.equal(restored.withdrawn_at, null);
    for (const [index, table] of tables.entries()) {
      assert.deepEqual((await database.query(`SELECT * FROM ${table}`)).rows, snapshots[index]);
    }
    const audits = await database.query("SELECT action FROM audit_logs ORDER BY id");
    assert.deepEqual(audits.rows.map((row) => row.action),
      ["enroll_course", "update_enrollment_resume", "withdraw_course", "reenroll_course"]);
  });

  test("prerequisite SQL distinguishes missing, active and completed enrollments", async () => {
    await database.query("INSERT INTO course_prerequisites VALUES (20, 21)");
    await assert.rejects(service.enroll({ course_id: "20" }, learner), { statusCode: 409 });
    await service.enroll({ course_id: "21" }, learner);
    await assert.rejects(service.enroll({ course_id: "20" }, learner), { statusCode: 409 });
    await database.query("UPDATE enrollments SET status = 'completed', completed_at = NOW() WHERE course_id = 21");
    assert.equal((await service.enroll({ course_id: "20" }, learner)).created, true);
    await assert.rejects(service.enroll({ course_id: "22" }, learner), { statusCode: 409 });
    await assert.rejects(service.enroll({ course_id: "999" }, learner), { statusCode: 404 });
  });

  test("owned queries, filtering and resume validation use actual database relationships", async () => {
    const { enrollment } = await service.enroll({ course_id: "20" }, learner);
    await service.enroll({ course_id: "21" }, learner);
    await service.enroll({ course_id: "20" }, otherLearner);
    await assert.rejects(service.getById(enrollment.id, otherLearner), { statusCode: 404 });
    await assert.rejects(service.withdraw(enrollment.id, otherLearner), { statusCode: 404 });
    await assert.rejects(service.resume(enrollment.id, { lesson_id: "40" }, otherLearner), { statusCode: 404 });
    await assert.rejects(service.resume(enrollment.id, { lesson_id: "41" }, learner), { statusCode: 404 });
    await database.query("UPDATE lessons SET status = 'hidden' WHERE id = 40");
    await assert.rejects(service.resume(enrollment.id, { lesson_id: "40" }, learner), { statusCode: 404 });
    const firstPage = await service.list({ limit: "1" }, learner);
    assert.equal(firstPage.data.length, 1);
    assert.equal(firstPage.pagination.has_more, true);
    assert.equal(typeof firstPage.data[0].course.id, "string");
    const secondPage = await service.list({ limit: "1", offset: "1" }, learner);
    assert.equal(secondPage.pagination.has_more, false);
    assert.notEqual(firstPage.data[0].id, secondPage.data[0].id);
    await service.withdraw(enrollment.id, learner);
    const withdrawn = await service.list({ status: "withdrawn" }, learner);
    assert.deepEqual(withdrawn.data.map((row) => row.id), [enrollment.id]);
  });

  test("database audit failure rolls back enrollment insertion", async () => {
    await database.query(`
      CREATE FUNCTION reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'test audit failure'; END;
      $$;
      CREATE TRIGGER reject_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_audit();
    `);
    try {
      await assert.rejects(service.enroll({ course_id: "20" }, learner), /test audit failure/);
      assert.equal((await database.query("SELECT * FROM enrollments")).rowCount, 0);
      assert.equal((await database.query("SELECT * FROM audit_logs")).rowCount, 0);
    } finally {
      await database.query("DROP TRIGGER reject_audit ON audit_logs; DROP FUNCTION reject_audit()");
    }
  });
});
