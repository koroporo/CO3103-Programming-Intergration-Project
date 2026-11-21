const express = require("express");
const quizAttemptController = require("../../controllers/Assessment/quizAttemptController");
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const { authorizeRoles } = require("../../middleware/Authentication/roleMiddleware");

const router = express.Router();

router.get(
  "/authoring-data",
  authenticate,
  authorizeRoles("instructor"),
  quizAttemptController.getAuthoringData
);
router.post(
  "/",
  authenticate,
  authorizeRoles("instructor"),
  quizAttemptController.createAssessment
);
router.get(
  "/",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.listAvailableAssessments
);
router.get(
  "/attempts/history",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.listAttemptHistory
);
router.get(
  "/attempts/:attemptId/result",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.getAttemptResult
);
router.get(
  "/attempts/:attemptId",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.getAttempt
);
router.put(
  "/attempts/:attemptId/answers",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.saveAnswers
);
router.post(
  "/attempts/:attemptId/submit",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.submitAttempt
);
router.post(
  "/:assessmentId/attempts",
  authenticate,
  authorizeRoles("learner"),
  quizAttemptController.startAttempt
);

module.exports = router;
