const express = require("express");
const courseController = require("../controllers/courseController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// app.js đã gắn tiền tố /course, nên /post ở đây là /course/post.
router.post(
  "/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createCourse
);

router.post(
  "/chapter/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createChapter
);

router.post(
  "/lesson/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createLesson
);

router.post(
  "/material/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createMaterial
);

module.exports = router;
