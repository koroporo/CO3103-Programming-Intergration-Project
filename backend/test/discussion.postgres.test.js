const { describe, test, before, beforeEach, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
process.env.JWT_SECRET = "discussion-integration-test-secret-only";
const app = require("../src/server");
const pool = require("../src/db");
const { generateToken } = require("../src/services/Authentication/tokenService");
const { seedDiscussions } = require("./discussionFixtures");
const connectionString = process.env.TEST_DATABASE_URL;

describe("lesson discussion and notification API on PostgreSQL", { skip: !connectionString }, () => {
  const schema = `discussion_test_${randomUUID().replaceAll("-", "")}`;
  let admin, database, server, baseUrl, schemaCreated = false;
  const users = { 10: "learner", 11: "learner", 12: "instructor", 13: "instructor", 14: "admin",
    15: "user", 16: "learner", 17: "learner", 18: "learner", 19: "learner", 999: "learner" };

  before(async () => {
    mock.method(console, "log", () => {});
    mock.method(console, "error", () => {});
    admin = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
    await admin.query(`CREATE SCHEMA ${schema}`);
    schemaCreated = true;
    database = new Pool({ connectionString, options: `-c search_path=${schema}`, connectionTimeoutMillis: 5000 });
    await database.query(await readFile(path.join(__dirname, "../../database/init.sql"), "utf8"));
    // Apply twice to verify that existing installations can safely rerun the index migration.
    const indexes = await readFile(path.join(__dirname, "../../database/migrations/20261120_discussion_indexes.sql"), "utf8");
    await database.query(indexes);
    await database.query(indexes);
    mock.method(pool, "query", (...args) => database.query(...args));
    mock.method(pool, "connect", (...args) => database.connect(...args));
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  beforeEach(() => seedDiscussions(database));
  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    mock.restoreAll();
    if (database) await database.end();
    if (schemaCreated) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    if (admin) await admin.end();
    await pool.end();
  });

  async function request(method, route, body, actor = 10, cookie = false) {
    const token = typeof actor === "number" ? generateToken({ id: String(actor), role: users[actor] }) : actor;
    const response = await fetch(`${baseUrl}${route}`, { method,
      headers: { "Content-Type": "application/json", ...(token ? cookie ? { Cookie: `token=${token}` } : { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  }
  const rootPath = "/lessons/40/discussions";
  async function topic(actor = 10, content = "How do I solve this question?") {
    const result = await request("POST", rootPath, { content }, actor);
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body.data;
  }
  async function reply(parent, actor = 11, content = "Here is an explanation.") {
    const result = await request("POST", `${rootPath}/${parent.id}/replies`, { content }, actor);
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body.data;
  }

  test("every forum and notification route requires valid authentication", async () => {
    const routes = [["GET", rootPath], ["POST", rootPath], ["GET", `${rootPath}/1`],
      ["PATCH", `${rootPath}/1`], ["DELETE", `${rootPath}/1`],
      ["GET", `${rootPath}/1/replies`], ["POST", `${rootPath}/1/replies`],
      ["GET", "/notification/get"], ["PATCH", "/notification/1/read"], ["PATCH", "/notification/read-all"]];
    for (const token of [null, "invalid", generateToken({ id: "10", role: "learner" }).slice(0, -4) + "xxxx"]) {
      for (const [method, route] of routes) assert.equal((await request(method, route, undefined, token)).status, 401);
    }
  });

  test("cookie sessions work and posts persist for other learners", async () => {
    const created = await request("POST", rootPath, { content: "  Hỏi đáp\nLine two  ", author_id: "14", is_pinned: true }, 10, true);
    assert.equal(created.status, 201);
    assert.equal(created.body.data.author_id, "10");
    assert.equal(created.body.data.content, "Hỏi đáp\nLine two");
    assert.equal(created.body.data.is_pinned, false);
    const listed = await request("GET", rootPath, undefined, 11);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.data[0].id, created.body.data.id);
    assert.equal(listed.body.data[0].author_name, "Learner One");
    assert.equal(listed.body.data[0].reply_count, 0);
    assert.equal(listed.body.permissions.can_moderate, false);
    assert.equal((await database.query("SELECT COUNT(*) FROM discussions")).rows[0].count, "1");
  });

  for (const actor of [13, 15, 16, 17, 19, 999]) {
    test(`account ${actor} cannot read or write discussions without current course access`, async () => {
      const parent = await topic();
      for (const [method, route, body] of [["GET", rootPath], ["POST", rootPath, { content: "Denied" }],
        ["GET", `${rootPath}/${parent.id}`], ["GET", `${rootPath}/${parent.id}/replies`],
        ["POST", `${rootPath}/${parent.id}/replies`, { content: "Denied" }],
        ["PATCH", `${rootPath}/${parent.id}`, { is_resolved: true }], ["DELETE", `${rootPath}/${parent.id}`]]) {
        assert.equal((await request(method, route, body, actor)).status, 403);
      }
    });
  }

  test("completed learners, the course instructor and admins can participate", async () => {
    for (const actor of [18, 12, 14]) {
      await topic(actor);
      assert.equal((await request("GET", rootPath, undefined, actor)).status, 200);
    }
  });

  test("current database role, suspension and enrollment override stale JWT claims", async () => {
    const stale = generateToken({ id: "10", role: "admin" });
    const parent = await topic(11);
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { is_pinned: true }, stale)).status, 403);
    await database.query("UPDATE accounts SET status = 'suspended' WHERE id = 10");
    assert.equal((await request("GET", rootPath, undefined, stale)).status, 403);
    await database.query("UPDATE accounts SET status = 'active', role = 'user' WHERE id = 10");
    assert.equal((await request("GET", rootPath, undefined, stale)).status, 403);
    await database.query("UPDATE accounts SET role = 'learner' WHERE id = 10; UPDATE enrollments SET status = 'withdrawn' WHERE learner_id = 10");
    assert.equal((await request("GET", rootPath, undefined, stale)).status, 403);
  });

  test("hidden or archived content is unavailable and drafts require course moderators", async () => {
    for (const [table, id] of [["lessons", 40], ["courses", 20]]) {
      for (const status of ["hidden", "archived"]) {
        await database.query(`UPDATE ${table} SET status = $1 WHERE id = $2`, [status, id]);
        assert.equal((await request("GET", rootPath)).status, 404);
        assert.equal((await request("POST", rootPath, { content: "No" })).status, 404);
      }
      await database.query(`UPDATE ${table} SET status = 'draft' WHERE id = $1`, [id]);
      assert.equal((await request("GET", rootPath)).status, 403);
      assert.equal((await request("GET", rootPath, undefined, 12)).status, 200);
      await database.query(`UPDATE ${table} SET status = 'published' WHERE id = $1`, [id]);
    }
    assert.equal((await request("GET", "/lessons/999/discussions")).status, 404);
  });

  test("threads are lesson-scoped and replies are limited to one level", async () => {
    const parent = await topic();
    const answer = await reply(parent);
    assert.equal((await request("POST", `${rootPath}/${answer.id}/replies`, { content: "Nested" })).status, 400);
    assert.equal((await request("GET", `${rootPath}/${answer.id}/replies`)).status, 400);
    const foreign = `/lessons/42/discussions/${parent.id}`;
    for (const [method, route, body] of [["GET", foreign], ["PATCH", foreign, { content: "Changed" }],
      ["DELETE", foreign], ["POST", `${foreign}/replies`, { content: "Wrong lesson" }]]) {
      assert.equal((await request(method, route, body)).status, 404);
    }
    assert.equal((await request("GET", `${rootPath}/${parent.id}/replies`)).body.data[0].id, answer.id);
  });

  test("content ownership, resolve and pin permissions are enforced", async () => {
    const parent = await topic();
    const answer = await reply(parent);
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { content: "Edited" })).status, 200);
    for (const actor of [11, 12, 14]) {
      assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { content: "Tampered" }, actor)).status, 403);
    }
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { is_resolved: true }, 11)).status, 403);
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { is_resolved: true })).status, 200);
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { is_pinned: true })).status, 403);
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { is_pinned: true }, 12)).status, 200);
    assert.equal((await request("PATCH", `${rootPath}/${parent.id}`, { is_resolved: false }, 14)).status, 200);
    assert.equal((await request("PATCH", `${rootPath}/${answer.id}`, { is_resolved: true }, 11)).status, 400);
    const current = (await request("GET", `${rootPath}/${parent.id}`)).body.data;
    assert.equal(current.content, "Edited");
    assert.equal(current.is_pinned, true);
    assert.equal(current.is_resolved, false);
  });

  test("delete is a soft transition, hides replies and rejects later replies", async () => {
    const parent = await topic();
    const answer = await reply(parent);
    assert.equal((await request("DELETE", `${rootPath}/${parent.id}`, undefined, 11)).status, 403);
    assert.equal((await request("DELETE", `${rootPath}/${parent.id}`, undefined, 12)).status, 204);
    assert.deepEqual((await request("GET", rootPath)).body.data, []);
    assert.equal((await request("GET", `${rootPath}/${answer.id}`)).status, 404);
    assert.equal((await request("POST", `${rootPath}/${parent.id}/replies`, { content: "Too late" })).status, 404);
    assert.deepEqual((await database.query("SELECT status FROM discussions ORDER BY id")).rows.map((r) => r.status), ["deleted", "deleted"]);
  });

  test("hidden roots prevent reading, editing and replying to their visible children", async () => {
    const parent = await topic();
    const answer = await reply(parent);
    await database.query("UPDATE discussions SET status = 'hidden' WHERE id = $1", [parent.id]);
    assert.equal((await request("GET", `${rootPath}/${answer.id}`)).status, 404);
    assert.equal((await request("PATCH", `${rootPath}/${answer.id}`, { content: "No" }, 11)).status, 404);
    assert.equal((await request("POST", `${rootPath}/${parent.id}/replies`, { content: "No" })).status, 404);
  });

  test("topic and reply pagination is stable, bounded and respects pinned order", async () => {
    const first = await topic();
    const second = await topic();
    await request("PATCH", `${rootPath}/${first.id}`, { is_pinned: true }, 12);
    const page1 = (await request("GET", `${rootPath}?limit=1`)).body;
    assert.deepEqual(page1.data.map((p) => p.id), [first.id]);
    assert.equal(page1.pagination.has_more, true);
    assert.deepEqual((await request("GET", `${rootPath}?limit=1&offset=1`)).body.data.map((p) => p.id), [second.id]);
    const answer1 = await reply(first);
    await reply(first, 10);
    const replies = (await request("GET", `${rootPath}/${first.id}/replies?limit=1`)).body;
    assert.equal(replies.data[0].id, answer1.id);
    assert.equal(replies.pagination.has_more, true);
    assert.equal((await request("GET", rootPath)).body.data[0].reply_count, 2);
  });

  test("new topics and replies notify the instructor and participants without notifying the sender", async () => {
    const parent = await topic();
    let rows = (await database.query("SELECT * FROM notifications ORDER BY id")).rows;
    assert.deepEqual(rows.map((n) => n.recipient_id), ["12"]);
    const answer = await reply(parent);
    rows = (await database.query("SELECT * FROM notifications WHERE dedupe_key = $1 ORDER BY recipient_id", [`discussion:${answer.id}:thread:${parent.id}`])).rows;
    assert.deepEqual(rows.map((n) => n.recipient_id), ["10", "12"]);
    assert.equal(rows[0].lesson_id, "40");
    assert.equal(rows[0].course_id, "20");
    assert.match(rows[0].body, /Learner Two/);
    await reply(parent, 12);
    rows = (await database.query("SELECT * FROM notifications ORDER BY id DESC LIMIT 2")).rows;
    assert.deepEqual(rows.map((n) => n.recipient_id).sort(), ["10", "11"]);
  });

  test("participants who are suspended or withdrawn receive no new notifications", async () => {
    const parent = await topic();
    await reply(parent);
    await database.query("UPDATE accounts SET status = 'suspended' WHERE id = 10; UPDATE enrollments SET status = 'withdrawn' WHERE learner_id = 11");
    const answer = await reply(parent, 12);
    assert.equal((await database.query("SELECT * FROM notifications WHERE dedupe_key = $1", [`discussion:${answer.id}:thread:${parent.id}`])).rowCount, 0);
  });

  test("notification reads are personal, persistent, idempotent and paginated", async () => {
    await topic();
    await topic();
    const list = (await request("GET", "/notification/get?limit=1", undefined, 12)).body;
    assert.equal(list.notifications.length, 1);
    assert.equal(list.pagination.has_more, true);
    assert.equal(list.unread_count, 2);
    const id = list.notifications[0].id;
    assert.equal((await request("PATCH", `/notification/${id}/read`, undefined, 10)).status, 404);
    const marked = await request("PATCH", `/notification/${id}/read`, undefined, 12);
    assert.ok(marked.body.notification.read_at);
    assert.equal((await request("PATCH", `/notification/${id}/read`, undefined, 12)).body.notification.read_at, marked.body.notification.read_at);
    assert.equal((await request("GET", "/notification/get?unread=true", undefined, 12)).body.notifications.length, 1);
    assert.equal((await request("GET", "/notification/get?recipient_id=12")).body.notifications.length, 0);
    assert.equal((await request("PATCH", "/notification/read-all", undefined, 12)).status, 204);
    assert.equal((await request("GET", "/notification/get", undefined, 12)).body.unread_count, 0);
    assert.equal((await request("PATCH", "/notification/read-all", undefined, 12)).status, 204);
  });

  test("invalid payloads, IDs, flags and queries return JSON validation errors", async () => {
    const parent = await topic();
    const cases = [["POST", rootPath, {}], ["POST", rootPath, { content: " " }],
      ["POST", rootPath, { content: "x".repeat(10001) }], ["POST", rootPath, { content: "a\0b" }],
      ["PATCH", `${rootPath}/${parent.id}`, { author_id: "14" }],
      ["PATCH", `${rootPath}/${parent.id}`, { is_pinned: "true" }],
      ["GET", "/lessons/9223372036854775808/discussions"], ["GET", `${rootPath}/NaN`],
      ["GET", `${rootPath}?limit=0`], ["GET", `${rootPath}?limit=1&limit=2`],
      ["GET", `${rootPath}?offset=-1`], ["GET", "/notification/get?unread=1"],
      ["GET", "/notification/get?limit=101"], ["PATCH", "/notification/invalid/read"]];
    for (const [method, route, body] of cases) {
      const result = await request(method, route, body);
      assert.equal(result.status, 400, `${method} ${route}: ${JSON.stringify(result.body)}`);
      assert.equal(typeof result.body.message, "string");
    }
  });

  test("notification insertion failure rolls back the discussion and hides SQL errors", async () => {
    await database.query(`CREATE FUNCTION reject_notification() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'private notification failure'; END; $$;
      CREATE TRIGGER reject_notification BEFORE INSERT ON notifications FOR EACH ROW EXECUTE FUNCTION reject_notification();`);
    try {
      const result = await request("POST", rootPath, { content: "Must roll back" });
      assert.equal(result.status, 500);
      assert.deepEqual(result.body, { message: "Internal server error" });
      assert.equal((await database.query("SELECT * FROM discussions")).rowCount, 0);
      assert.equal((await database.query("SELECT * FROM notifications")).rowCount, 0);
    } finally {
      await database.query("DROP TRIGGER reject_notification ON notifications; DROP FUNCTION reject_notification()");
    }
  });

  test("concurrent replies serialize with deletion and cannot leave visible orphans", async () => {
    const parent = await topic();
    const results = await Promise.all([
      request("POST", `${rootPath}/${parent.id}/replies`, { content: "Concurrent reply" }, 11),
      request("DELETE", `${rootPath}/${parent.id}`),
    ]);
    assert.ok([201, 404].includes(results[0].status), JSON.stringify(results));
    assert.equal(results[1].status, 204);
    assert.equal((await database.query("SELECT * FROM discussions WHERE status = 'visible'")).rowCount, 0);
  });
});
