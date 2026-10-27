const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateAssessmentInput,
  validateAnswers
} = require("../src/services/assessmentValidation");
const { gradeAttempt } = require("../src/services/assessmentRules");

function createQuestion() {
  return {
    prompt: "Choose the correct answer",
    skill_id: "12",
    options: [
      { text: "A", is_correct: true },
      { text: "B", is_correct: false },
      { text: "C", is_correct: false },
      { text: "D", is_correct: false }
    ]
  };
}

function createAssessmentBody() {
  return {
    title: "Lesson quiz",
    course_id: "2",
    lesson_id: "8",
    questions: [createQuestion()]
  };
}

test("validates and normalizes a four-option single-answer quiz", () => {
  const result = validateAssessmentInput(createAssessmentBody());

  assert.equal(result.title, "Lesson quiz");
  assert.equal(result.timeLimit, 1800);
  assert.equal(result.maxAttempts, 3);
  assert.equal(result.passingPercent, 70);
  assert.equal(result.questions[0].options.length, 4);
  assert.equal(result.questions[0].options.filter((option) => option.isCorrect).length, 1);
});

test("rejects a question without exactly four options", () => {
  const body = createAssessmentBody();
  body.questions[0].options.pop();

  assert.throws(() => validateAssessmentInput(body), /exactly four options/);
});

test("rejects questions with zero or multiple correct options", () => {
  const noneCorrect = createAssessmentBody();
  noneCorrect.questions[0].options.forEach((option) => {
    option.is_correct = false;
  });
  assert.throws(() => validateAssessmentInput(noneCorrect), /exactly one correct option/);

  const multipleCorrect = createAssessmentBody();
  multipleCorrect.questions[0].options[1].is_correct = true;
  assert.throws(() => validateAssessmentInput(multipleCorrect), /exactly one correct option/);
});

test("rejects malformed identifiers and attempt limits", () => {
  const badCourseId = createAssessmentBody();
  badCourseId.course_id = "0";
  assert.throws(() => validateAssessmentInput(badCourseId), /course_id must be a positive PostgreSQL BIGINT/);

  const oversizedId = createAssessmentBody();
  oversizedId.course_id = "9223372036854775808";
  assert.throws(() => validateAssessmentInput(oversizedId), /course_id must be a positive PostgreSQL BIGINT/);

  const badTimeLimit = createAssessmentBody();
  badTimeLimit.time_limit_seconds = 0;
  assert.throws(() => validateAssessmentInput(badTimeLimit), /time_limit_seconds/);
});

test("rejects duplicate or malformed saved answers", () => {
  assert.throws(() => validateAnswers([
    { attempt_question_id: "3", selected_option_id: "10" },
    { attempt_question_id: "3", selected_option_id: "11" }
  ]), /only be answered once/);
  assert.throws(() => validateAnswers([
    { attempt_question_id: "3", selected_option_id: null }
  ]), /selected_option_id must be a positive PostgreSQL BIGINT/);
});

test("grades correct, incorrect, and unanswered options against the frozen answer key", () => {
  const questions = [
    { id: "1", answer_key_snapshot: { correct_option_id: "11" }, max_points: "1" },
    { id: "2", answer_key_snapshot: { correct_option_id: "21" }, max_points: "2" },
    { id: "3", answer_key_snapshot: { correct_option_id: "31" }, max_points: "1" }
  ];
  const answers = new Map([
    ["1", { selected_option_id: "11" }],
    ["2", { selected_option_id: "22" }]
  ]);

  const result = gradeAttempt(questions, answers, "25");

  assert.equal(result.score, 1);
  assert.equal(result.maxPoints, 4);
  assert.equal(result.scorePercent, 25);
  assert.equal(result.isPassed, true);
  assert.equal(result.questions[2].selectedOptionId, null);
  assert.equal(result.questions[2].awardedPoints, 0);
});

test("requires the configured threshold to pass", () => {
  const result = gradeAttempt(
    [{ id: "1", answer_key_snapshot: '{"correct_option_id":"9"}', max_points: "1" }],
    new Map(),
    1
  );

  assert.equal(result.isPassed, false);
});
