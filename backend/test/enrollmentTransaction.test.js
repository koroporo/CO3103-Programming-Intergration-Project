const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../src/db");
const { withTransaction } = require("../src/models/enrollmentModel");

after(async () => pool.end());

test("transaction commits only after work succeeds and releases the client", async (t) => {
  const events = [];
  const client = { query: async (sql) => events.push(sql), release: () => events.push("release") };
  t.mock.method(pool, "connect", async () => client);
  const result = await withTransaction(async (connection) => {
    assert.equal(connection, client);
    events.push("enrollment + audit");
    return "saved";
  });
  assert.equal(result, "saved");
  assert.deepEqual(events, ["BEGIN", "enrollment + audit", "COMMIT", "release"]);
});

test("audit/write failure rolls back and preserves the original error", async (t) => {
  const events = [];
  const failure = new Error("audit failed");
  const client = { query: async (sql) => events.push(sql), release: () => events.push("release") };
  t.mock.method(pool, "connect", async () => client);
  await assert.rejects(withTransaction(async () => { throw failure; }), (error) => error === failure);
  assert.deepEqual(events, ["BEGIN", "ROLLBACK", "release"]);
});

test("failed rollback discards the connection without hiding the write error", async (t) => {
  const failure = new Error("write failed");
  const rollbackFailure = new Error("connection lost");
  const client = {
    query: async (sql) => { if (sql === "ROLLBACK") throw rollbackFailure; },
    release: t.mock.fn()
  };
  t.mock.method(pool, "connect", async () => client);
  await assert.rejects(withTransaction(async () => { throw failure; }), (error) => error === failure);
  assert.deepEqual(client.release.mock.calls[0].arguments, [rollbackFailure]);
});
