const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "enrollment-api-test-secret-only";
const app = require("../src/app");
const pool = require("../src/db");
const accountModel = require("../src/models/accountModel");
const model = require("../src/models/enrollmentModel");
const { generateToken } = require("../src/services/tokenService");

const learner = { id: "10", role: "learner", status: "active" };
const active = {
  id: "50", learner_id: "10", course_id: "20", status: "active",
  resume_lesson_id: "40", enrolled_at: "2026-10-01T00:00:00.000Z",
  last_accessed_at: "2026-10-02T00:00:00.000Z", withdrawn_at: null, completed_at: null
};
const endpoints = [
  ["POST", "/post"], ["GET", "/get"], ["GET", "/get/50"],
  ["PATCH", "/withdraw/50"], ["PATCH", "/resume/50"]
];
let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/enrollment`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

async function request(method, path, body, token = generateToken(learner)) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return { status: response.status, body: await response.json() };
}

function setup(t, existing) {
  t.mock.method(accountModel, "findById", async () => learner);
  const client = {};
  const mocks = {};
  const implementations = {
    withTransaction: async (work) => work(client),
    lockLearner: async () => learner,
    findByCourse: async () => existing,
    lockOwnedEnrollment: async () => existing,
    lockCourse: async () => ({ id: "20", status: "published" }),
    findMissingPrerequisites: async () => [],
    createEnrollment: async (_client, learnerId, courseId) => ({
      ...active, learner_id: learnerId, course_id: courseId, resume_lesson_id: null, last_accessed_at: null
    }),
    reactivateEnrollment: async () => ({ ...existing, status: "active", withdrawn_at: null, completed_at: null }),
    withdrawEnrollment: async () => ({ ...existing, status: "withdrawn", withdrawn_at: "2026-10-21T00:00:00.000Z" }),
    findPublishedLesson: async () => ({ id: "40" }),
    updateResume: async (_client, _id, lessonId) => ({ ...existing, resume_lesson_id: lessonId }),
    createAudit: async () => {},
    listByLearner: async () => [],
    findOwnedById: async () => existing
  };
  for (const [name, implementation] of Object.entries(implementations)) {
    mocks[name] = t.mock.method(model, name, implementation);
  }
  return { client, ...mocks };
}

test("every enrollment endpoint requires a valid token", async () => {
  const tokens = [null, "invalid", jwt.sign(learner, process.env.JWT_SECRET, { expiresIn: -1 }),
    jwt.sign(learner, "wrong-secret")];
  for (const token of tokens) {
    for (const [method, path] of endpoints) {
      assert.equal((await request(method, path, method === "GET" ? undefined : {}, token)).status, 401);
    }
  }
});

test("current database role and account status govern every endpoint", async (t) => {
  const lookup = t.mock.method(accountModel, "findById");
  for (const account of [undefined, ...["user", "instructor", "admin"].map((role) => ({ ...learner, role })),
    ...["suspended", "deleted"].map((status) => ({ ...learner, status }))]) {
    lookup.mock.mockImplementation(async () => account);
    for (const [method, path] of endpoints) {
      assert.equal((await request(method, path, method === "GET" ? undefined : {})).status, 403);
    }
  }
});

test("enrollment takes identity from auth and ignores client-controlled status/progress", async (t) => {
  const mocks = setup(t);
  const result = await request("POST", "/post", {
    course_id: "20", learner_id: "99", status: "completed", resume_lesson_id: "999",
    completed_at: "2026-10-21T00:00:00Z"
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.data.learner_id, "10");
  assert.equal(result.body.data.status, "active");
  assert.equal(result.body.data.resume_lesson_id, null);
  assert.deepEqual(mocks.createEnrollment.mock.calls[0].arguments, [mocks.client, "10", "20"]);
  const [client, actor, action, before, after] = mocks.createAudit.mock.calls[0].arguments;
  assert.equal(client, mocks.client);
  assert.deepEqual(actor, learner);
  assert.equal(action, "enroll_course");
  assert.equal(before, undefined);
  assert.equal(after.id, "50");
});

test("role/status are rechecked under the transaction lock before writes", async (t) => {
  const mocks = setup(t);
  for (const account of [undefined, { ...learner, role: "instructor" }, { ...learner, status: "suspended" }]) {
    mocks.lockLearner.mock.mockImplementation(async () => account);
    for (const [method, path, body] of [
      ["POST", "/post", { course_id: "20" }], ["PATCH", "/withdraw/50", undefined],
      ["PATCH", "/resume/50", { lesson_id: "40" }]
    ]) assert.equal((await request(method, path, body)).status, 403);
  }
  assert.equal(mocks.findByCourse.mock.callCount(), 0);
  assert.equal(mocks.lockOwnedEnrollment.mock.callCount(), 0);
  assert.equal(mocks.createAudit.mock.callCount(), 0);
});

test("missing/unpublished course and unmet prerequisites cannot create enrollment", async (t) => {
  const mocks = setup(t);
  for (const status of [undefined, "draft", "hidden", "archived"]) {
    mocks.lockCourse.mock.mockImplementation(async () => status ? { id: "20", status } : undefined);
    assert.equal((await request("POST", "/post", { course_id: "20" })).status, status ? 409 : 404);
  }
  mocks.lockCourse.mock.mockImplementation(async () => ({ id: "20", status: "published" }));
  mocks.findMissingPrerequisites.mock.mockImplementation(async () => [{ prerequisite_course_id: "19" }]);
  assert.equal((await request("POST", "/post", { course_id: "20" })).status, 409);
  assert.equal(mocks.createEnrollment.mock.callCount(), 0);
  assert.equal(mocks.createAudit.mock.callCount(), 0);
});

for (const status of ["active", "completed"]) {
  test(`retry preserves ${status} enrollment without writes or extra audit`, async (t) => {
    const existing = { ...active, status, completed_at: status === "completed" ? "2026-10-20T00:00:00Z" : null };
    const mocks = setup(t, existing);
    const result = await request("POST", "/post", { course_id: "20" });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data, existing);
    assert.equal(mocks.createEnrollment.mock.callCount(), 0);
    assert.equal(mocks.reactivateEnrollment.mock.callCount(), 0);
    assert.equal(mocks.createAudit.mock.callCount(), 0);
  });
}

test("reenrollment reuses withdrawn enrollment and keeps its resume pointer", async (t) => {
  const withdrawn = { ...active, status: "withdrawn", withdrawn_at: "2026-10-20T00:00:00Z" };
  const mocks = setup(t, withdrawn);
  const result = await request("POST", "/post", { course_id: "20" });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.id, withdrawn.id);
  assert.equal(result.body.data.status, "active");
  assert.equal(result.body.data.resume_lesson_id, withdrawn.resume_lesson_id);
  assert.equal(result.body.data.enrolled_at, withdrawn.enrolled_at);
  assert.equal(result.body.data.withdrawn_at, null);
  assert.equal(mocks.createEnrollment.mock.callCount(), 0);
  assert.equal(mocks.createAudit.mock.calls[0].arguments[2], "reenroll_course");
});

test("reenrollment still requires a published course and completed prerequisites", async (t) => {
  const mocks = setup(t, { ...active, status: "withdrawn" });
  mocks.lockCourse.mock.mockImplementation(async () => ({ id: "20", status: "hidden" }));
  assert.equal((await request("POST", "/post", { course_id: "20" })).status, 409);
  mocks.lockCourse.mock.mockImplementation(async () => ({ id: "20", status: "published" }));
  mocks.findMissingPrerequisites.mock.mockImplementation(async () => [{ prerequisite_course_id: "19" }]);
  assert.equal((await request("POST", "/post", { course_id: "20" })).status, 409);
  assert.equal(mocks.reactivateEnrollment.mock.callCount(), 0);
});

test("withdraw is a soft transition, is idempotent and cannot reset completion", async (t) => {
  const mocks = setup(t, active);
  const result = await request("PATCH", "/withdraw/50");
  assert.equal(result.status, 200);
  assert.equal(result.body.data.status, "withdrawn");
  assert.equal(result.body.data.resume_lesson_id, "40");
  assert.equal(mocks.createAudit.mock.calls[0].arguments[2], "withdraw_course");
  mocks.lockOwnedEnrollment.mock.mockImplementation(async () => result.body.data);
  assert.equal((await request("PATCH", "/withdraw/50")).status, 200);
  mocks.lockOwnedEnrollment.mock.mockImplementation(async () => ({ ...active, status: "completed" }));
  assert.equal((await request("PATCH", "/withdraw/50")).status, 409);
  assert.equal(mocks.withdrawEnrollment.mock.callCount(), 1);
  assert.equal(mocks.createAudit.mock.callCount(), 1);
});

test("detail, withdrawal and resume scope lookups to the authenticated owner", async (t) => {
  const mocks = setup(t);
  assert.equal((await request("GET", "/get/999")).status, 404);
  assert.equal((await request("PATCH", "/withdraw/999")).status, 404);
  assert.equal((await request("PATCH", "/resume/999", { lesson_id: "40" })).status, 404);
  assert.deepEqual(mocks.findOwnedById.mock.calls[0].arguments, ["999", "10"]);
  for (const call of mocks.lockOwnedEnrollment.mock.calls) {
    assert.deepEqual(call.arguments, [mocks.client, "999", "10"]);
  }
  assert.equal(mocks.updateResume.mock.callCount(), 0);
  assert.equal(mocks.withdrawEnrollment.mock.callCount(), 0);
});

test("resume requires an active enrollment and a published lesson in its course", async (t) => {
  const mocks = setup(t, active);
  const result = await request("PATCH", "/resume/50", { lesson_id: "41", status: "completed" });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.resume_lesson_id, "41");
  assert.equal(result.body.data.status, "active");
  assert.deepEqual(mocks.findPublishedLesson.mock.calls[0].arguments, [mocks.client, "41", "20"]);
  mocks.findPublishedLesson.mock.mockImplementation(async () => undefined);
  assert.equal((await request("PATCH", "/resume/50", { lesson_id: "99" })).status, 404);
  for (const status of ["withdrawn", "completed"]) {
    mocks.lockOwnedEnrollment.mock.mockImplementation(async () => ({ ...active, status }));
    assert.equal((await request("PATCH", "/resume/50", { lesson_id: "40" })).status, 409);
  }
  mocks.lockOwnedEnrollment.mock.mockImplementation(async () => active);
  mocks.lockCourse.mock.mockImplementation(async () => ({ id: "20", status: "archived" }));
  assert.equal((await request("PATCH", "/resume/50", { lesson_id: "40" })).status, 409);
  assert.equal(mocks.updateResume.mock.callCount(), 1);
});

test("list uses the current learner, validates filters and returns pagination", async (t) => {
  const mocks = setup(t, active);
  mocks.listByLearner.mock.mockImplementation(async () => [active, { ...active, id: "51" }]);
  const result = await request("GET", "/get?status=active&limit=1&offset=2&learner_id=99");
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data, [active]);
  assert.deepEqual(result.body.pagination, { limit: 1, offset: 2, has_more: true });
  assert.deepEqual(mocks.listByLearner.mock.calls[0].arguments,
    ["10", { status: "active", limit: 1, offset: 2 }]);
  mocks.listByLearner.mock.mockImplementation(async () => []);
  const empty = await request("GET", "/get");
  assert.deepEqual(empty.body, { data: [], pagination: { limit: 20, offset: 0, has_more: false } });
  const detail = await request("GET", "/get/50");
  assert.deepEqual(detail.body.data, active);
});

test("invalid bodies, IDs and pagination fail before enrollment database access", async (t) => {
  const mocks = setup(t);
  const invalidIds = [null, 0, -1, 1.5, true, {}, [], "1 OR 1=1", "9223372036854775808", Number.MAX_SAFE_INTEGER + 1];
  const cases = [
    ...[undefined, null, [], {}, "text"].map((body) => ["POST", "/post", body]),
    ...invalidIds.map((id) => ["POST", "/post", { course_id: id }]),
    ...invalidIds.map((id) => ["PATCH", "/resume/50", { lesson_id: id }]),
    ...["get", "withdraw", "resume"].map((action) => [action === "get" ? "GET" : "PATCH", `/${action}/invalid`, undefined]),
    ...["status=invalid", "status=active&status=withdrawn", "limit=0", "limit=101", "limit=1.5",
      "limit=1&limit=2", "offset=-1", "offset=2147483648", "limit="].map((query) => ["GET", `/get?${query}`, undefined])
  ];
  for (const [method, path, body] of cases) {
    assert.equal((await request(method, path, body)).status, 400, `${method} ${path}: ${JSON.stringify(body)}`);
  }
  assert.equal(mocks.withTransaction.mock.callCount(), 0);
  assert.equal(mocks.findOwnedById.mock.callCount(), 0);
  assert.equal(mocks.listByLearner.mock.callCount(), 0);
});

test("BIGINT course and lesson IDs remain exact", async (t) => {
  const mocks = setup(t, active);
  const id = "9223372036854775807";
  mocks.findByCourse.mock.mockImplementation(async () => undefined);
  assert.equal((await request("POST", "/post", { course_id: id })).status, 201);
  assert.equal(mocks.createEnrollment.mock.calls[0].arguments[2], id);
  assert.equal((await request("PATCH", "/resume/50", { lesson_id: id })).status, 200);
  assert.equal(mocks.updateResume.mock.calls[0].arguments[2], id);
});

test("audit failure returns a sanitized error rather than a success response", async (t) => {
  const mocks = setup(t);
  mocks.createAudit.mock.mockImplementation(async () => { throw new Error("private SQL details"); });
  t.mock.method(console, "error", () => {});
  const result = await request("POST", "/post", { course_id: "20" });
  assert.equal(result.status, 500);
  assert.deepEqual(result.body, { message: "Internal server error" });
});
