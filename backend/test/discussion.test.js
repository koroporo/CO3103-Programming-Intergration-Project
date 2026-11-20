const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { contentText, positiveId, pageQuery, postBody, patchBody } = require("../src/utils/discussionUtils");
const pool = require("../src/db");
const { withTransaction } = require("../src/models/Discussion/discussionModel");

after(() => pool.end());

test("discussion content preserves plain text, trims edges and rejects invalid input", () => {
  assert.equal(contentText("  Hỏi đáp\n<script>alert(1)</script>  "), "Hỏi đáp\n<script>alert(1)</script>");
  assert.equal(contentText("😀".repeat(10000)).length, 20000);
  for (const content of [undefined, null, "", " \n ", 12, {}, [], true, "a\0b", "x".repeat(10001)]) {
    assert.throws(() => contentText(content), { statusCode: 400 });
  }
  for (const body of [undefined, null, [], "text", {}]) assert.throws(() => postBody(body), { statusCode: 400 });
  assert.deepEqual(postBody({ content: "hello", author_id: "999", is_pinned: true }), { content: "hello" });
});

test("discussion IDs preserve BIGINT precision and reject invalid IDs", () => {
  assert.equal(positiveId("9223372036854775807", "id"), "9223372036854775807");
  for (const id of ["9223372036854775808", Number.MAX_SAFE_INTEGER + 1, "01", "1e3", "1 OR 1=1", 0, -1, 1.5, [], {}, true]) {
    assert.throws(() => positiveId(id, "id"), { statusCode: 400 });
  }
});

test("pagination rejects duplicate query parameters and unbounded reads", () => {
  assert.deepEqual(pageQuery({}), { limit: 20, offset: 0 });
  assert.deepEqual(pageQuery({ limit: "100", offset: "2147483647" }), { limit: 100, offset: 2147483647 });
  for (const query of [{ limit: "0" }, { limit: "101" }, { limit: "" }, { limit: ["1", "2"] },
    { offset: "-1" }, { offset: "1.5" }, { offset: "2147483648" }]) {
    assert.throws(() => pageQuery(query), { statusCode: 400 });
  }
});

test("updates allow only explicit content and boolean thread flags", () => {
  assert.deepEqual(patchBody({ content: " updated ", is_resolved: false, is_pinned: true }),
    { content: "updated", is_resolved: false, is_pinned: true });
  for (const body of [{}, [], null, { author_id: "99" }, { status: "visible" }, { parent_id: "99" },
    { lesson_id: "41" }, { is_pinned: "true" }, { is_resolved: 1 }]) {
    assert.throws(() => patchBody(body), { statusCode: 400 });
  }
});

test("transaction commits once and releases its connection", async (t) => {
  const queries = [];
  const client = { query: async (sql) => queries.push(sql), release: t.mock.fn() };
  t.mock.method(pool, "connect", async () => client);
  assert.equal(await withTransaction(async (connection) => { assert.equal(connection, client); return 42; }), 42);
  assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
  assert.equal(client.release.mock.callCount(), 1);
});

test("transaction rolls back failed writes without masking the original error", async (t) => {
  const queries = [];
  const original = new Error("notification failed");
  const rollbackFailure = new Error("connection lost");
  const client = { query: async (sql) => { queries.push(sql); if (sql === "ROLLBACK") throw rollbackFailure; }, release: t.mock.fn() };
  t.mock.method(pool, "connect", async () => client);
  await assert.rejects(withTransaction(async () => { throw original; }), (error) => error === original);
  assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
  assert.equal(client.release.mock.calls[0].arguments[0], rollbackFailure);
});
