const express = require("express");
const crypto = require("crypto");
const pool = require("./db");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

//COOKIE
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// DEBUG
app.get("/accounts", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        email,
        full_name,
        role,
        status,
        avatar_url,
        bio,
        target_overall_band,
        target_skill,
        target_exam_date,
        created_at,
        updated_at
      FROM accounts
      ORDER BY id`
    );

    return res.status(200).json({
      accounts: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch accounts:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
// DEBUG: Create a course
app.post("/courses", async (req, res) => {
  try {
    const {
      instructor_id,
      category_id,
      title,
      slug,
      description,
      prerequisite_text,
      thumbnail_url,
      status,
      is_featured,
    } = req.body;

    // Basic validation
    if (
      !instructor_id ||
      !category_id ||
      !title ||
      !slug ||
      !description ||
      !status
    ) {
      return res.status(400).json({
        message: "Missing required course fields",
      });
    }

    const result = await pool.query(
      `INSERT INTO courses (
        instructor_id,
        category_id,
        title,
        slug,
        description,
        prerequisite_text,
        thumbnail_url,
        status,
        is_featured,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING *`,
      [
        instructor_id,
        category_id,
        title,
        slug,
        description,
        prerequisite_text ?? null,
        thumbnail_url ?? null,
        status,
        is_featured ?? false,
      ]
    );

    return res.status(201).json({
      message: "Course created successfully",
      course: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to create course:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
// DEBUG: Get all courses
app.get("/courses", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        instructor_id,
        category_id,
        title,
        slug,
        description,
        prerequisite_text,
        thumbnail_url,
        status,
        is_featured,
        created_at,
        updated_at,
        published_at
      FROM courses
      ORDER BY id`
    );

    return res.status(200).json({
      courses: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
 // DEBUG: Get all role applications
app.get("/role-applications", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        applicant_id,
        requested_role,
        application_text,
        evidence_url,
        status,
        reviewed_by,
        review_note,
        submitted_at,
        reviewed_at
      FROM role_applications
      ORDER BY id`
    );

    return res.status(200).json({
      applications: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch role applications:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});



//WORKFLOW HERE

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed", error);
    res.status(503).json({ status: "error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//LOG IN, REGISTER 
const authRoutes = require("./routes/Authentication/authRoutes");
const preferencesRoutes = require("./routes/Authentication/preferencesRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferencesRoutes);
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}



// ROLE APPLICATIONS
const applicationRoutes = require("./routes/InstructorApplication/roleApplicationRoutes");
app.use("/role-applications", applicationRoutes);

module.exports = app;

//COURSES 
const courseRoutes = require("./routes/Course/courseRoutes");
app.use("/api/courses", courseRoutes);
