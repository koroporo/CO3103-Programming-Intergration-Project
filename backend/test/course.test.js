const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "course-api-test-secret-only";

const app = require("../src/app");
const pool = require("../src/db");
const accountModel = require("../src/models/accountModel");
const courseModel = require("../src/models/courseModel");
const { generateToken } = require("../src/services/tokenService");

let server;
let baseUrl;
const instructor = { id: "10", role: "instructor", status: "active" };
const ownCourse = { id: "20", instructor_id: "10", status: "draft" };
const courseBody = { category_id: "1", title: "Khóa học IELTS", description: "Luyện IELTS cơ bản" };
const chapterBody = { course_id: "20", title: "Listening", position: 1 };
const lessonBody = { chapter_id: "30", title: "Bài 1", position: 1 };
const materialBody = {
  lesson_id: "40", title: "Ghi chú", material_type: "text", text_content: "Nội dung", position: 1
};

before(async () => {
  // GET chỉ có trong test: mô phỏng route đọc mà thành viên khác sẽ bổ sung.
  app.get("/course/get/:id", (req, res) => {
    res.json({ id: req.params.id });
  });

  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

async function post(path, body, token = generateToken(instructor)) {
  const response = await fetch(`${baseUrl}/course${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

function allowInstructor(t, account = instructor) {
  t.mock.method(accountModel, "findById", async () => account);
}

test("POST middleware does not impose instructor access on future GET routes", async (t) => {
  const lookup = t.mock.method(accountModel, "findById");
  const response = await fetch(`${baseUrl}/course/get/20`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: "20" });
  assert.equal(lookup.mock.callCount(), 0);
});

test("all POST routes require authentication", async () => {
  for (const path of ["/post", "/chapter/post", "/lesson/post", "/material/post"]) {
    assert.equal((await post(path, {}, null)).status, 401);
  }
});

test("invalid, expired and incorrectly signed tokens are rejected", async () => {
  const tokens = [
    "invalid-token",
    jwt.sign({ id: "10", role: "instructor" }, process.env.JWT_SECRET, { expiresIn: -1 }),
    jwt.sign({ id: "10", role: "instructor" }, "different-secret")
  ];
  for (const token of tokens) assert.equal((await post("/post", courseBody, token)).status, 401);
});

for (const role of ["user", "learner", "admin"]) {
  test(`${role} cannot create any course content even with an old instructor token`, async (t) => {
    allowInstructor(t, { ...instructor, role });
    for (const path of ["/post", "/chapter/post", "/lesson/post", "/material/post"]) {
      assert.equal((await post(path, {})).status, 403);
    }
  });
}

test("suspended, deleted and missing accounts cannot write", async (t) => {
  const lookup = t.mock.method(accountModel, "findById");
  for (const account of [{ ...instructor, status: "suspended" }, { ...instructor, status: "deleted" }, undefined]) {
    lookup.mock.mockImplementation(async () => account);
    assert.equal((await post("/post", courseBody)).status, 403);
  }
});

test("course uses authenticated owner and ignores privileged body fields", async (t) => {
  allowInstructor(t);
  t.mock.method(courseModel, "findCategoryById", async () => ({ id: "1" }));
  const create = t.mock.method(courseModel, "createCourse", async (data, ownerId) => ({
    id: "20", ...data, instructor_id: ownerId, status: "draft", is_featured: false
  }));
  const result = await post("/post", {
    ...courseBody, instructor_id: "99", status: "published", is_featured: true
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.data.instructor_id, "10");
  const [data, ownerId] = create.mock.calls[0].arguments;
  assert.equal(ownerId, "10");
  for (const field of ["instructor_id", "status", "is_featured"]) assert.equal(field in data, false);
  assert.match(data.slug, /^khoa-hoc-ielts-[a-f0-9-]+$/);
});

test("missing category returns 404 without an insert", async (t) => {
  allowInstructor(t);
  t.mock.method(courseModel, "findCategoryById", async () => undefined);
  const create = t.mock.method(courseModel, "createCourse");
  assert.equal((await post("/post", courseBody)).status, 404);
  assert.equal(create.mock.callCount(), 0);
});

const children = [
  { path: "/chapter/post", body: chapterBody, lookup: "findCourseById", create: "createChapter" },
  { path: "/lesson/post", body: lessonBody, lookup: "findCourseByChapterId", create: "createLesson" },
  { path: "/material/post", body: materialBody, lookup: "findCourseByLessonId", create: "createMaterial" }
];

for (const child of children) {
  test(`${child.path} creates content for its owner`, async (t) => {
    allowInstructor(t);
    t.mock.method(courseModel, child.lookup, async () => ownCourse);
    const create = t.mock.method(courseModel, child.create, async (data) => ({ id: "50", ...data }));
    const result = await post(child.path, child.body);
    assert.equal(result.status, 201);
    assert.equal(result.body.data.title, child.body.title);
    assert.equal(create.mock.callCount(), 1);
    if (child.create === "createLesson") {
      assert.equal(result.body.data.is_required, true);
      assert.equal(result.body.data.required_watch_percentage, 80);
    }
  });

  for (const [scenario, course, status] of [
    ["another instructor's course", { ...ownCourse, instructor_id: "99" }, 403],
    ["a missing parent", undefined, 404],
    ["an archived course", { ...ownCourse, status: "archived" }, 409],
    ["a hidden course", { ...ownCourse, status: "hidden" }, 409]
  ]) {
    test(`${child.path} rejects ${scenario} without an insert`, async (t) => {
      allowInstructor(t);
      t.mock.method(courseModel, child.lookup, async () => course);
      const create = t.mock.method(courseModel, child.create);
      assert.equal((await post(child.path, child.body)).status, status);
      assert.equal(create.mock.callCount(), 0);
    });
  }
}

test("invalid input is rejected before database lookups", async (t) => {
  allowInstructor(t);
  const lookups = ["findCategoryById", "findCourseById", "findCourseByChapterId", "findCourseByLessonId"]
    .map((name) => t.mock.method(courseModel, name));
  const cases = [
    ["/post", undefined], ["/post", null], ["/post", []], ["/post", {}],
    ["/post", { ...courseBody, category_id: "1 OR 1=1" }],
    ["/post", { ...courseBody, category_id: "9223372036854775808" }],
    ["/post", { ...courseBody, category_id: Number.MAX_SAFE_INTEGER + 1 }],
    ["/post", { ...courseBody, title: " " }],
    ["/post", { ...courseBody, title: "a".repeat(251) }],
    ["/post", { ...courseBody, slug: "Invalid Slug" }],
    ["/post", { ...courseBody, thumbnail_url: "javascript:alert(1)" }],
    ["/chapter/post", { ...chapterBody, position: 0 }],
    ["/chapter/post", { ...chapterBody, position: 1.5 }],
    ["/chapter/post", { ...chapterBody, position: 2147483648 }],
    ["/lesson/post", { ...lessonBody, is_required: "false" }],
    ...[0, 101, 0.001, "80", null].map((value) => [
      "/lesson/post", { ...lessonBody, required_watch_percentage: value }
    ]),
    ["/material/post", { ...materialBody, material_type: "video" }],
    ["/material/post", { ...materialBody, text_content: " " }],
    ["/material/post", { ...materialBody, material_type: "file" }],
    ["/material/post", { ...materialBody, duration_seconds: 10 }],
    ["/material/post", { ...materialBody, material_type: "audio", resource_url: "audio.mp3", duration_seconds: 0 }]
  ];
  for (const [path, body] of cases) {
    const result = await post(path, body);
    assert.equal(result.status, 400, `${path}: ${JSON.stringify(body)}`);
  }
  for (const lookup of lookups) assert.equal(lookup.mock.callCount(), 0);
});

test("BIGINT IDs remain exact and custom slugs are preserved", async (t) => {
  allowInstructor(t);
  const categoryId = "9223372036854775807";
  const lookup = t.mock.method(courseModel, "findCategoryById", async () => ({ id: categoryId }));
  t.mock.method(courseModel, "createCourse", async (data) => ({ id: "20", ...data }));
  const result = await post("/post", { ...courseBody, category_id: categoryId, slug: "ielts-basic" });
  assert.equal(result.status, 201);
  assert.equal(lookup.mock.calls[0].arguments[0], categoryId);
  assert.equal(result.body.data.slug, "ielts-basic");
});

for (const type of ["audio", "slides", "file"]) {
  test(`${type} material accepts an object key and optional fields`, async (t) => {
    allowInstructor(t);
    t.mock.method(courseModel, "findCourseByLessonId", async () => ownCourse);
    t.mock.method(courseModel, "createMaterial", async (data) => ({ id: "50", ...data }));
    const result = await post("/material/post", {
      ...materialBody, material_type: type, resource_url: "materials/resource",
      is_required: false, ...(type === "audio" ? { duration_seconds: 120 } : {})
    });
    assert.equal(result.status, 201);
    assert.equal(result.body.data.resource_url, "materials/resource");
    assert.equal(result.body.data.text_content, null);
    assert.equal(result.body.data.is_required, false);
  });
}

for (const [code, status] of [["23505", 409], ["23503", 404], ["XX000", 500]]) {
  test(`database error ${code} returns ${status} without SQL details`, async (t) => {
    allowInstructor(t);
    t.mock.method(courseModel, "findCategoryById", async () => ({ id: "1" }));
    t.mock.method(courseModel, "createCourse", async () => {
      throw Object.assign(new Error("private database details"), { code });
    });
    t.mock.method(console, "error", () => {});
    const result = await post("/post", courseBody);
    assert.equal(result.status, status);
    assert.equal(JSON.stringify(result.body).includes("private database details"), false);
  });
}

test("malformed JSON returns a JSON 400 response", async () => {
  const response = await fetch(`${baseUrl}/course/post`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: '{"title":'
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "Invalid JSON body" });
});
