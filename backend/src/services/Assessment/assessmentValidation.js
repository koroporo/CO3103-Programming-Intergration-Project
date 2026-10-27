const { createError, positiveId } = require("../ultils/courseUltils");

const MAX_QUESTIONS = 50;
const OPTION_COUNT = 4;

function validateAssessmentInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError(400, "A JSON object is required");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 250) {
    throw createError(400, "Title is required and must be at most 250 characters");
  }

  if (!Array.isArray(body.questions) || body.questions.length === 0 || body.questions.length > MAX_QUESTIONS) {
    throw createError(400, `Questions must contain between 1 and ${MAX_QUESTIONS} items`);
  }

  const timeLimit = body.time_limit_seconds ?? 1800;
  if (!Number.isInteger(timeLimit) || timeLimit < 1 || timeLimit > 86400) {
    throw createError(400, "time_limit_seconds must be an integer between 1 and 86400");
  }

  const maxAttempts = body.max_attempts ?? 3;
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 100) {
    throw createError(400, "max_attempts must be an integer between 1 and 100");
  }

  const passingPercent = body.passing_percent ?? 70;
  if (!Number.isFinite(passingPercent) || passingPercent < 0 || passingPercent > 100) {
    throw createError(400, "passing_percent must be a number between 0 and 100");
  }

  const questions = body.questions.map((question, questionIndex) => {
    const questionNumber = questionIndex + 1;
    const prompt = typeof question?.prompt === "string" ? question.prompt.trim() : "";

    if (!prompt || prompt.length > 5000) {
      throw createError(400, `Question ${questionNumber} must have a prompt of at most 5000 characters`);
    }

    if (!Array.isArray(question?.options) || question.options.length !== OPTION_COUNT) {
      throw createError(400, `Question ${questionNumber} must have exactly four options`);
    }

    const options = question.options.map((option, optionIndex) => {
      const text = typeof option?.text === "string" ? option.text.trim() : "";
      if (!text || text.length > 1000) {
        throw createError(400, `Option ${String.fromCharCode(65 + optionIndex)} in question ${questionNumber} is invalid`);
      }

      return { text, isCorrect: option.is_correct === true };
    });

    if (options.filter((option) => option.isCorrect).length !== 1) {
      throw createError(400, `Question ${questionNumber} must have exactly one correct option`);
    }

    return {
      prompt,
      skillId: positiveId(question.skill_id, `Question ${questionNumber} skill_id`),
      options
    };
  });

  return {
    title,
    courseId: positiveId(body.course_id, "course_id"),
    lessonId: positiveId(body.lesson_id, "lesson_id"),
    timeLimit,
    maxAttempts,
    passingPercent,
    questions
  };
}

function validateAnswers(answers) {
  if (!Array.isArray(answers)) {
    throw createError(400, "answers must be an array");
  }

  const seenQuestions = new Set();
  return answers.map((answer, index) => {
    const attemptQuestionId = positiveId(answer?.attempt_question_id, `answers[${index}].attempt_question_id`);
    const selectedOptionId = positiveId(answer?.selected_option_id, `answers[${index}].selected_option_id`);

    if (seenQuestions.has(attemptQuestionId)) {
      throw createError(400, "An attempt question may only be answered once per request");
    }
    seenQuestions.add(attemptQuestionId);

    return { attemptQuestionId, selectedOptionId };
  });
}

module.exports = {
  MAX_QUESTIONS,
  OPTION_COUNT,
  positiveId,
  validateAssessmentInput,
  validateAnswers
};
