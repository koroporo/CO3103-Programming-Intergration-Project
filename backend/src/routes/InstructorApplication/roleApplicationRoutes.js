const express = require("express");
const router = express.Router();

const {
  submitInstructorApplication,
  listApplications,  reviewApplication,
} = require("../../controllers/InstructorApplication/roleApplicationControllers");

const {
  authenticate,
} = require("../../middleware/Authentication/authMiddleware");

const {
  authorizeRoles,
} = require("../../middleware/Authentication/roleMiddleware");

router.post("/", authenticate, submitInstructorApplication);
router.get("/", authenticate, authorizeRoles("admin"), listApplications);
router.patch("/:id", authenticate, authorizeRoles("admin"), reviewApplication);

module.exports = router;
