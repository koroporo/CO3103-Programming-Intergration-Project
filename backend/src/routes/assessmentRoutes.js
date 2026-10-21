const express = require("express");
const assessmentController = require("../controllers/assessmentController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/authoring-data",
  authenticate,
  authorizeRoles("instructor"),
  assessmentController.getAuthoringData
);
router.post(
  "/",
  authenticate,
  authorizeRoles("instructor"),
  assessmentController.createAssessment
);
router.get(
  "/",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.listAvailableAssessments
);
router.get(
  "/attempts/history",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.listAttemptHistory
);
router.get(
  "/attempts/:attemptId/result",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.getAttemptResult
);
router.get(
  "/attempts/:attemptId",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.getAttempt
);
router.put(
  "/attempts/:attemptId/answers",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.saveAnswers
);
router.post(
  "/attempts/:attemptId/submit",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.submitAttempt
);
router.post(
  "/:assessmentId/attempts",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.startAttempt
);

module.exports = router;
