const express = require("express");
const router = express.Router();

const {
  submitInstructorApplication,
} = require("../../controllers/InstructorApplication/roleApplicationControllers");

const {
  authenticate,
} = require("../../middleware/Authentication/authMiddleware");

router.post("/", authenticate, submitInstructorApplication);

module.exports = router;
