const assessmentService = require("../../services/Assessment/assessmentService");

async function getAuthoringData(req, res) {
  const courses = await assessmentService.getAuthoringData(req.user.id);
  res.json({ data: courses });
}

async function createAssessment(req, res) {
  const assessment = await assessmentService.createAssessment(req.body, req.user);
  res.status(201).json({
    message: "Assessment created successfully",
    data: assessment
  });
}

async function listAvailableAssessments(req, res) {
  const assessments = await assessmentService.listAvailableAssessments(req.user.id);
  res.json({ data: assessments });
}

async function startAttempt(req, res) {
  const attempt = await assessmentService.startAttempt(req.params.assessmentId, req.user.id);
  res.status(201).json({
    message: "Assessment attempt started",
    data: attempt
  });
}

async function getAttempt(req, res) {
  const attempt = await assessmentService.getAttemptForLearner(req.params.attemptId, req.user.id);
  res.json({ data: attempt });
}

async function saveAnswers(req, res) {
  const result = await assessmentService.saveAttemptAnswers(
    req.params.attemptId,
    req.user.id,
    req.body?.answers
  );
  res.json({ message: "Answers saved", data: result });
}

async function submitAttempt(req, res) {
  const attempt = await assessmentService.submitAttempt(
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
  const result = await assessmentService.getAttemptResult(req.params.attemptId, req.user.id);
  res.json({ data: result });
}

async function listAttemptHistory(req, res) {
  const history = await assessmentService.listAttemptHistory(req.user.id);
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
