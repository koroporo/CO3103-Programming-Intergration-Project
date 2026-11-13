const { describe, test, before, beforeEach, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
process.env.JWT_SECRET = "admin-delete-test-only";
const pool = require("../src/db");
const app = require("../src/server");
const { generateToken } = require("../src/services/Authentication/tokenService");
const service = require("../src/services/Admin/adminDeletionService");

const connectionString = process.env.TEST_DATABASE_URL;
describe("admin deletion with PostgreSQL and HTTP", { skip: !connectionString }, () => {
  const schema = `admin_delete_test_${randomUUID().replaceAll("-", "")}`;
  let database, owner, server, baseUrl;
  let schemaCreated = false;
  const admin = { id: "10", role: "admin" };
  const adminToken = generateToken(admin);
  const learnerToken = generateToken({ id: "11", role: "learner" });
  before(async () => {
    owner = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
    await owner.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    database = new Pool({ connectionString, options: `-c search_path=${schema}`, connectionTimeoutMillis: 5000 });
    await database.query(await readFile(path.join(__dirname, "../../database/init.sql"), "utf8"));
    await database.query(await readFile(path.join(__dirname, "../../database/migrations/20261015_add_target_skill.sql"), "utf8"));
    mock.method(pool, "query", (...args) => database.query(...args));
    mock.method(pool, "connect", (...args) => database.connect(...args));
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });
  beforeEach(async () => {
    await database.query(`
      TRUNCATE accounts, categories CASCADE;
      INSERT INTO accounts (id, email, password_hash, full_name, role, status, created_at, updated_at)
      VALUES (10, 'admin@test.local', 'secret-hash', 'Admin', 'admin', 'active', NOW(), NOW()),
        (11, 'learner@test.local', 'secret-hash', 'Learner', 'learner', 'active', NOW(), NOW()),
        (12, 'instructor@test.local', 'secret-hash', 'Instructor', 'instructor', 'active', NOW(), NOW()),
        (13, 'admin2@test.local', 'secret-hash', 'Admin2', 'admin', 'active', NOW(), NOW());
      INSERT INTO categories (id, name, slug) VALUES (1, 'Test', 'test');
      INSERT INTO courses (id, instructor_id, category_id, title, slug, description, status, is_featured, created_at, updated_at)
      VALUES (20, 12, 1, 'Course', 'course', 'Test', 'published', TRUE, NOW(), NOW());
      INSERT INTO enrollments (id, learner_id, course_id, status, enrolled_at)
      VALUES (30, 11, 20, 'active', NOW());
      INSERT INTO auth_tokens (user_id, token_hash, purpose, created_at, expires_at)
      VALUES (11, 'test-hash', 'refresh', NOW(), NOW() + INTERVAL '1 day');
    `);
  });
  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    mock.restoreAll();
    if (database) await database.end();
    if (schemaCreated) await owner.query(`DROP SCHEMA ${schema} CASCADE`);
    if (owner) await owner.end();
    await pool.end();
  });
  async function request(route, token = adminToken, body, method = "DELETE", cookie = false) {
    const response = await fetch(baseUrl + route, {
      method,
      headers: { ...(token ? cookie ? { Cookie: `token=${token}` } : { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  }
  for (const route of ["/accounts/11", "/courses/20"]) {
    test(`${route} requires valid authentication and an admin`, async () => {
      assert.equal((await request(route, null)).status, 401);
      assert.equal((await request(route, "bad-token")).status, 401);
      assert.equal((await request(route, jwt.sign(admin, "wrong-secret"))).status, 401);
      assert.equal((await request(route, jwt.sign(admin, process.env.JWT_SECRET, { expiresIn: -1 }))).status, 401);
      assert.equal((await request(route, learnerToken)).status, 403);
      assert.equal((await database.query("SELECT * FROM audit_logs")).rowCount, 0);
    });
  }
  test("account deletion preserves references, revokes tokens and records trusted audit data", async () => {
    const result = await request("/accounts/11", adminToken, { reason: "  Duplicate account  ", actor_id: 13, role: "learner" });
    assert.equal(result.status, 200);
    assert.equal(result.body.account.status, "deleted");
    assert.equal(JSON.stringify(result.body).includes("secret-hash"), false);
    assert.equal((await database.query("SELECT * FROM enrollments WHERE id = 30")).rowCount, 1);
    assert.ok((await database.query("SELECT revoked_at FROM auth_tokens WHERE user_id = 11")).rows[0].revoked_at);
    const audit = (await database.query("SELECT * FROM audit_logs")).rows[0];
    assert.equal(audit.actor_id, "10");
    assert.equal(audit.actor_role_snapshot, "admin");
    assert.equal(audit.action, "delete_account");
    assert.equal(audit.entity_type, "account");
    assert.equal(audit.entity_id, "11");
    assert.equal(audit.before_data.status, "active");
    assert.equal(audit.after_data.status, "deleted");
    assert.equal(audit.reason, "Duplicate account");
    assert.equal(JSON.stringify(audit).includes("secret-hash"), false);
    assert.equal((await request("/api/auth/me", learnerToken, undefined, "GET")).status, 401);
    const list = await request("/accounts", adminToken, undefined, "GET");
    assert.equal(list.status, 200);
    assert.equal(list.body.accounts.some((account) => account.id === "11"), false);
  });
  test("cookie authentication archives a course while retaining learning history", async () => {
    const result = await request("/courses/20", adminToken, undefined, "DELETE", true);
    assert.equal(result.status, 200);
    assert.equal(result.body.course.status, "archived");
    assert.equal(result.body.course.is_featured, false);
    assert.equal((await database.query("SELECT * FROM enrollments WHERE course_id = 20")).rowCount, 1);
    const audit = (await database.query("SELECT * FROM audit_logs")).rows[0];
    assert.equal(audit.action, "delete_course");
    assert.equal(audit.before_data.status, "published");
    assert.equal(audit.after_data.status, "archived");
    assert.equal((await request("/courses", null, undefined, "GET")).body.courses.length, 0);
    assert.equal((await request("/courses/search", null, undefined, "GET")).status, 200);
  });
  test("missing records, invalid BIGINT ids and invalid reasons do not write audits", async () => {
    for (const resource of ["accounts", "courses"]) {
      assert.equal((await request(`/${resource}/999`)).status, 404);
      for (const id of ["0", "-1", "abc", "1%20OR%201=1", "9223372036854775808"]) {
        assert.equal((await request(`/${resource}/${id}`)).status, 400);
      }
    }
    for (const body of [{ reason: " " }, { reason: 123 }, { reason: "a".repeat(2001) }, []]) {
      assert.equal((await request("/accounts/11", adminToken, body)).status, 400);
    }
    assert.equal((await database.query("SELECT * FROM audit_logs")).rowCount, 0);
  });
  test("self deletion and deleting another administrator are rejected", async () => {
    assert.equal((await request("/accounts/10")).status, 409);
    assert.equal((await request("/accounts/13")).status, 409);
  });
  test("database status and role override stale JWT claims", async () => {
    await database.query("UPDATE accounts SET role = 'learner' WHERE id = 10");
    assert.equal((await request("/courses/20")).status, 403);
    await database.query("UPDATE accounts SET role = 'admin', status = 'suspended' WHERE id = 10");
    assert.equal((await request("/courses/20")).status, 401);
    await database.query("UPDATE accounts SET status = 'deleted' WHERE id = 10");
    assert.equal((await request("/accounts/11")).status, 401);
    // Also check inside the transaction, after middleware has run.
    await assert.rejects(service.remove("course", "20", undefined, admin), { statusCode: 403 });
  });
  test("concurrent repeated deletions produce a single audit for each entity", async () => {
    for (const route of ["/accounts/11", "/courses/20"]) {
      const responses = await Promise.all(Array.from({ length: 4 }, () => request(route)));
      assert.ok(responses.every((response) => response.status === 200));
    }
    assert.equal((await database.query("SELECT * FROM audit_logs")).rowCount, 2);
  });
  test("audit failure rolls back deletion and token revocation", async () => {
    await database.query(`CREATE FUNCTION reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'test audit failure'; END; $$;
      CREATE TRIGGER reject_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_audit();`);
    try {
      assert.equal((await request("/accounts/11")).status, 500);
      assert.equal((await request("/courses/20")).status, 500);
      assert.equal((await database.query("SELECT status FROM accounts WHERE id = 11")).rows[0].status, "active");
      assert.equal((await database.query("SELECT revoked_at FROM auth_tokens WHERE user_id = 11")).rows[0].revoked_at, null);
      assert.equal((await database.query("SELECT status FROM courses WHERE id = 20")).rows[0].status, "published");
      assert.equal((await database.query("SELECT * FROM audit_logs")).rowCount, 0);
    } finally {
      await database.query("DROP TRIGGER reject_audit ON audit_logs; DROP FUNCTION reject_audit()");
    }
  });
  test("admin registration and account listing require an active admin", async () => {
    assert.equal((await request("/api/auth/adminRegister", null, {}, "POST")).status, 401);
    assert.equal((await request("/api/auth/adminRegister", learnerToken, {}, "POST")).status, 403);
    assert.equal((await request("/accounts", null, undefined, "GET")).status, 401);
    assert.equal((await request("/accounts", learnerToken, undefined, "GET")).status, 403);
  });
});
