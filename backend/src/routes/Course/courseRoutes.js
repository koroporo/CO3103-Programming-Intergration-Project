const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Adjust to your PostgreSQL connection file
const courseController = require("../../controllers/Course/courseControllers");

// Search courses
router.get("/search", courseController.searchCourses);

// Load all courses to display all homepage
router.get("/", async (req, res) => {
  console.log("GET /courses route hit");
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        u.full_name AS instructor
      FROM courses c
      JOIN accounts u ON c.instructor_id = u.id
      ORDER BY c.created_at DESC;
    `);

    res.json({ courses: result.rows });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// GET one course: GET /api/courses/details/:id
router.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        c.id,
        c.instructor_id,
        c.category_id,
        c.title,
        c.slug,
        c.description,
        c.prerequisite_text,
        c.thumbnail_url,
        c.status,
        c.is_featured,
        c.created_at,
        c.updated_at,
        c.published_at,
        u.full_name AS instructor
      FROM courses c
      JOIN accounts u ON c.instructor_id = u.id
      WHERE c.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch course:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

// POST course
const {
  authenticate,
} = require("../../middleware/Authentication/authMiddleware");
const {
  authorizeRoles,
} = require("../../middleware/Authentication/roleMiddleware");

// app.js đã gắn tiền tố /course, nên /post ở đây là /course/post.
router.post(
  "/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createCourse,
);

router.post(
  "/chapter/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createChapter,
);

router.post(
  "/lesson/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createLesson,
);

router.post(
  "/material/post",
  authenticate,
  authorizeRoles("instructor"),
  courseController.createMaterial,
)



// GET COURSE

router.get(
  "/user/:user_id",
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getCoursesByUserId,
);

// GET course based on ID
router.get(
  "/get/:id",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getCourse,
);

// GET chapter based on ID
router.get(
  "/chapter/get/:id",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getChapter,
);

// GET chapter based on course's ID
router.get(
  "/:courseId/chapters",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getChaptersByCourseId
);


router.get(
  "/chapter/:id/lessons",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getLessons,
);
router.get(
  "/lesson/get/:id",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getLesson,
);
router.get(
  "/lesson/:id/materials",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getMaterials,
);
router.get(
  "/material/get/:id",
  authenticate,
  authorizeRoles("user", "learner", "instructor", "admin"),
  courseController.getMaterial,
);

module.exports = router;
