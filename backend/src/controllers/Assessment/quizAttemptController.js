const quizAttemptService = require("../../services/Assessment/quizAttemptService");

async function getAuthoringData(req, res) {
  const courses = await quizAttemptService.getAuthoringData(req.user.id);
  res.json({ data: courses });
}

async function createAssessment(req, res) {
  const assessment = await quizAttemptService.createAssessment(req.body, req.user);
  res.status(201).json({
    message: "Assessment created successfully",
    data: assessment
  });
}

async function listAvailableAssessments(req, res) {
  const assessments = await quizAttemptService.listAvailableAssessments(req.user.id);
  res.json({ data: assessments });
}

async function startAttempt(req, res) {
  const attempt = await quizAttemptService.startAttempt(req.params.assessmentId, req.user.id);
  res.status(201).json({
    message: "Assessment attempt started",
    data: attempt
  });
}

async function getAttempt(req, res) {
  const attempt = await quizAttemptService.getAttemptForLearner(req.params.attemptId, req.user.id);
  res.json({ data: attempt });
}

async function saveAnswers(req, res) {
  const result = await quizAttemptService.saveAttemptAnswers(
    req.params.attemptId,
    req.user.id,
    req.body?.answers
  );
  res.json({ message: "Answers saved", data: result });
}

async function submitAttempt(req, res) {
  const attempt = await quizAttemptService.submitAttempt(
    req.params.attemptId,
    req.user.id,
    req.body?.answers ?? []
  );
  res.json({
    message: "Assessment submitted and graded",
    data: {
      attempt_id: String(attempt.id),
      status: attempt.status,
      submission_reason: attempt.submission_reason,
      score: attempt.score,
      max_points: attempt.maxPoints,
      is_passed: attempt.isPassed
    }
  });
}

async function getAttemptResult(req, res) {
  const result = await quizAttemptService.getAttemptResult(req.params.attemptId, req.user.id);
  res.json({ data: result });
}

async function listAttemptHistory(req, res) {
  const history = await quizAttemptService.listAttemptHistory(req.user.id);
  res.json({ data: history });
}

module.exports = {
  getAuthoringData,
  createAssessment,
  listAvailableAssessments,
  startAttempt,
  getAttempt,
  saveAnswers,
  submitAttempt,
  getAttemptResult,
  listAttemptHistory
};
