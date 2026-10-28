
const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const { authorizeRoles } = require("../../middleware/Authentication/roleMiddleware");
const assessmentController = require("../../controllers/Assessment/assessmentController");

// Submit a writing assignment
router.post(
  "/submit",
  authenticate,
  authorizeRoles("learner"),
  assessmentController.submitAssessment
);

module.exports = router;
