const test = require("node:test");
const assert = require("node:assert/strict");

const shouldRun = process.env.RUN_ASSESSMENT_DB_TESTS === "1";

async function apiRequest(baseUrl, path, token, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" })
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) })
  });

  return { status: response.status, body: await response.json() };
}

test("assessment creation, saved answers, grading, history, and course completion", {
  skip: !shouldRun
}, async () => {
  const pool = require("../src/db");
  const suffix = `${Date.now()}-${process.pid}`;
  const jwtSecret = `assessment-integration-${suffix}`;
  process.env.JWT_SECRET = jwtSecret;
  const jwt = require("jsonwebtoken");
  const app = require("../src/app");
  const fixture = await pool.connect();
  let server;
  let instructorId;
  let learnerId;
  let categoryId;
  let courseId;
  let lessonId;
  let skillId;
  let enrollmentId;
  let assessmentId;
  let attemptId;

  try {
    await fixture.query("BEGIN");
    const instructor = await fixture.query(
      `INSERT INTO accounts (
         email, password_hash, full_name, role, status, created_at, updated_at
       ) VALUES ($1, 'test-hash', 'Quiz Test Instructor', 'instructor', 'active', NOW(), NOW())
       RETURNING id`,
      [`quiz-instructor-${suffix}@example.test`]
    );
    instructorId = instructor.rows[0].id;
    const learner = await fixture.query(
      `INSERT INTO accounts (
         email, password_hash, full_name, role, status, created_at, updated_at
       ) VALUES ($1, 'test-hash', 'Quiz Test Learner', 'learner', 'active', NOW(), NOW())
       RETURNING id`,
      [`quiz-learner-${suffix}@example.test`]
    );
    learnerId = learner.rows[0].id;
    const category = await fixture.query(
      `INSERT INTO categories (name, slug)
       VALUES ($1, $2)
       RETURNING id`,
      [`Quiz test ${suffix}`, `quiz-test-${suffix}`]
    );
    categoryId = category.rows[0].id;
    const course = await fixture.query(
      `INSERT INTO courses (
         instructor_id, category_id, title, slug, description,
         status, is_featured, created_at, updated_at
       ) VALUES ($1, $2, 'Assessment integration course', $3, 'Test fixture',
                 'published', FALSE, NOW(), NOW())
       RETURNING id`,
      [instructorId, categoryId, `assessment-test-${suffix}`]
    );
    courseId = course.rows[0].id;
    const chapter = await fixture.query(
      `INSERT INTO chapters (course_id, title, position)
       VALUES ($1, 'Test chapter', 1)
       RETURNING id`,
      [courseId]
    );
    const lesson = await fixture.query(
      `INSERT INTO lessons (
         chapter_id, title, position, is_required, required_watch_percentage,
         status, created_at, updated_at
       ) VALUES ($1, 'Test lesson', 1, TRUE, 80, 'published', NOW(), NOW())
       RETURNING id`,
      [chapter.rows[0].id]
    );
    lessonId = lesson.rows[0].id;
    const skill = await fixture.query(
      `INSERT INTO skills (code, name)
       VALUES ($1, 'Assessment integration skill')
       RETURNING id`,
      [`assessment-test-${suffix}`]
    );
    skillId = skill.rows[0].id;
    await fixture.query(
      `INSERT INTO lesson_skills (lesson_id, skill_id, minimum_mastery, expected_mastery)
       VALUES ($1, $2, 0, 1)`,
      [lessonId, skillId]
    );
    const enrollment = await fixture.query(
      `INSERT INTO enrollments (learner_id, course_id, status, enrolled_at)
       VALUES ($1, $2, 'active', NOW())
       RETURNING id`,
      [learnerId, courseId]
    );
    enrollmentId = enrollment.rows[0].id;
    await fixture.query("COMMIT");

    const instructorToken = jwt.sign({ id: String(instructorId), role: "instructor" }, jwtSecret);
    const learnerToken = jwt.sign({ id: String(learnerId), role: "learner" }, jwtSecret);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const preflight = await fetch(`${baseUrl}/assessments`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://127.0.0.1:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
      }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173");

    const forbidden = await apiRequest(baseUrl, "/assessments/authoring-data", learnerToken);
    assert.equal(forbidden.status, 403);
    const authoringData = await apiRequest(baseUrl, "/assessments/authoring-data", instructorToken);
    assert.equal(authoringData.status, 200);
    assert.ok(authoringData.body.data.some((courseData) => String(courseData.id) === String(courseId)));

    const created = await apiRequest(baseUrl, "/assessments", instructorToken, {
      method: "POST",
      body: {
        title: "Assessment integration quiz",
        course_id: String(courseId),
        lesson_id: String(lessonId),
        time_limit_seconds: 300,
        max_attempts: 1,
        passing_percent: 50,
        questions: [
          {
            prompt: "Question one",
            skill_id: String(skillId),
            options: [
              { text: "Correct one", is_correct: true },
              { text: "Wrong one", is_correct: false },
              { text: "Wrong two", is_correct: false },
              { text: "Wrong three", is_correct: false }
            ]
          },
          {
            prompt: "Question two",
            skill_id: String(skillId),
            options: [
              { text: "Correct two", is_correct: true },
              { text: "Wrong one", is_correct: false },
              { text: "Wrong two", is_correct: false },
              { text: "Wrong three", is_correct: false }
            ]
          }
        ]
      }
    });
    assert.equal(created.status, 201);
    assessmentId = created.body.data.id;

    const started = await apiRequest(
      baseUrl,
      `/assessments/${assessmentId}/attempts`,
      learnerToken,
      { method: "POST", body: {} }
    );
    assert.equal(started.status, 201);
    attemptId = started.body.data.id;
    assert.equal(started.body.data.questions.length, 2);
    assert.equal(started.body.data.questions[0].options.length, 4);
    assert.equal("correct_option_id" in started.body.data.questions[0], false);

    const attemptQuestions = await pool.query(
      `SELECT id, question_id
       FROM attempt_questions
       WHERE attempt_id = $1
       ORDER BY position`,
      [attemptId]
    );
    const optionRows = await pool.query(
      `SELECT question_id, id, is_correct
       FROM question_options
       WHERE question_id = ANY($1::bigint[])
       ORDER BY question_id, position`,
      [attemptQuestions.rows.map((question) => question.question_id)]
    );
    const correctOption = optionRows.rows.find((option) =>
      String(option.question_id) === String(attemptQuestions.rows[0].question_id) && option.is_correct
    );
    const wrongOption = optionRows.rows.find((option) =>
      String(option.question_id) === String(attemptQuestions.rows[1].question_id) && !option.is_correct
    );

    const saved = await apiRequest(
      baseUrl,
      `/assessments/attempts/${attemptId}/answers`,
      learnerToken,
      {
        method: "PUT",
        body: {
          answers: [
            {
              attempt_question_id: String(attemptQuestions.rows[0].id),
              selected_option_id: String(correctOption.id)
            },
            {
              attempt_question_id: String(attemptQuestions.rows[1].id),
              selected_option_id: String(wrongOption.id)
            }
          ]
        }
      }
    );
    assert.equal(saved.status, 200);

    const submitted = await apiRequest(
      baseUrl,
      `/assessments/attempts/${attemptId}/submit`,
      learnerToken,
      { method: "POST", body: {} }
    );
    assert.equal(submitted.status, 200);
    assert.equal(Number(submitted.body.data.score), 1);
    assert.equal(Number(submitted.body.data.max_points), 2);
    assert.equal(submitted.body.data.is_passed, true);

    const attemptResult = await apiRequest(
      baseUrl,
      `/assessments/attempts/${attemptId}/result`,
      learnerToken
    );
    assert.equal(attemptResult.status, 200);
    assert.equal(attemptResult.body.data.questions[0].selected_option_id, String(correctOption.id));
    assert.equal(attemptResult.body.data.questions[0].is_correct, true);
    assert.equal(attemptResult.body.data.questions[1].selected_option_id, String(wrongOption.id));
    assert.equal(attemptResult.body.data.questions[1].is_correct, false);
    assert.equal(attemptResult.body.data.questions[1].correct_option_text, "Correct two");

    const history = await apiRequest(
      baseUrl,
      "/assessments/attempts/history",
      learnerToken
    );
    assert.equal(history.status, 200);
    assert.equal(history.body.data.length, 1);
    assert.equal(String(history.body.data[0].id), String(attemptId));

    const progress = await pool.query(
      `SELECT lesson_progress.status AS lesson_status, enrollments.status AS enrollment_status
       FROM lesson_progress
       JOIN enrollments ON enrollments.id = lesson_progress.enrollment_id
       WHERE lesson_progress.enrollment_id = $1 AND lesson_progress.lesson_id = $2`,
      [enrollmentId, lessonId]
    );
    assert.equal(progress.rows[0].lesson_status, "completed");
    assert.equal(progress.rows[0].enrollment_status, "completed");

    await pool.query(
      `UPDATE enrollments
       SET status = 'active', completed_at = NULL
       WHERE id = $1`,
      [enrollmentId]
    );
    const maximumReached = await apiRequest(
      baseUrl,
      `/assessments/${assessmentId}/attempts`,
      learnerToken,
      { method: "POST", body: {} }
    );
    assert.equal(maximumReached.status, 409);
    assert.match(maximumReached.body.message, /Maximum number of attempts/);
  } finally {
    try {
      if (attemptId) {
        await pool.query(
          `DELETE FROM attempt_answers
           WHERE attempt_question_id IN (
             SELECT id FROM attempt_questions WHERE attempt_id = $1
           )`,
          [attemptId]
        );
        await pool.query("DELETE FROM attempt_questions WHERE attempt_id = $1", [attemptId]);
        await pool.query("DELETE FROM assessment_attempts WHERE id = $1", [attemptId]);
      }
      if (assessmentId) {
        await pool.query("DELETE FROM assessment_questions WHERE assessment_id = $1", [assessmentId]);
        await pool.query(
          `DELETE FROM question_options
           WHERE question_id IN (
             SELECT questions.id
             FROM questions
             JOIN question_banks ON question_banks.id = questions.question_bank_id
             WHERE question_banks.course_id = $1
           )`,
          [courseId]
        );
        await pool.query(
          `DELETE FROM questions
           WHERE question_bank_id IN (
             SELECT id FROM question_banks WHERE course_id = $1
           )`,
          [courseId]
        );
        await pool.query("DELETE FROM question_banks WHERE course_id = $1", [courseId]);
        await pool.query("DELETE FROM assessments WHERE id = $1", [assessmentId]);
      }
      if (enrollmentId) {
        await pool.query("DELETE FROM lesson_progress WHERE enrollment_id = $1", [enrollmentId]);
        await pool.query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]);
      }
      if (lessonId) await pool.query("DELETE FROM lesson_skills WHERE lesson_id = $1", [lessonId]);
      if (courseId) {
        await pool.query(
          `DELETE FROM lessons
           WHERE chapter_id IN (SELECT id FROM chapters WHERE course_id = $1)`,
          [courseId]
        );
        await pool.query("DELETE FROM chapters WHERE course_id = $1", [courseId]);
        await pool.query("DELETE FROM courses WHERE id = $1", [courseId]);
      }
      if (skillId) await pool.query("DELETE FROM skills WHERE id = $1", [skillId]);
      if (categoryId) await pool.query("DELETE FROM categories WHERE id = $1", [categoryId]);
      if (instructorId || learnerId) {
        await pool.query(
          "DELETE FROM accounts WHERE id = ANY($1::bigint[])",
          [[instructorId, learnerId].filter(Boolean)]
        );
      }
    } finally {
      if (server) {
        await new Promise((resolve, reject) => {
          server.close((error) => error ? reject(error) : resolve());
        });
      }
      fixture.release();
      await pool.end();
    }
  }
});
