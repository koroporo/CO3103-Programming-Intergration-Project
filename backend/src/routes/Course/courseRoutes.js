const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Adjust to your PostgreSQL connection file
const courseController = require("../../controllers/Course/courseControllers");

// Search courses
router.get("/search", courseController.searchCourses);

// Load all courses to display all homepage
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
    c.id,
    c.title,
    c.slug,
    c.description,
    c.thumbnail_url,
    u.full_name AS instructor
FROM courses c
JOIN accounts u ON c.instructor_id = u.id
ORDER BY c.created_at DESC;
    `);

    res.json(result.rows);
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
      [id]
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

module.exports = router;
