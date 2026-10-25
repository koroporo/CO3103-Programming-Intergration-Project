const pool = require("../../db");

// Escape special characters used in SQL LIKE patterns.
function escapeLike(text) {
  return text.replace(/[\\%_]/g, "\\$&");
}

// Shared filters for published-course search and its count query.
const FROM_AND_FILTERS = `
  FROM courses
  JOIN categories ON categories.id = courses.category_id
  JOIN accounts ON accounts.id = courses.instructor_id
  LEFT JOIN course_skills AS selected_skill
    ON selected_skill.course_id = courses.id
    AND selected_skill.skill_id = (
      SELECT id FROM skills WHERE code = $3::text
    )
  WHERE courses.status = 'published'
    AND (
      $1::text = ''
      OR courses.title ILIKE $2
      OR courses.description ILIKE $2
      OR categories.name ILIKE $2
    )
    AND ($3::text IS NULL OR selected_skill.skill_id IS NOT NULL)
    AND ($4::numeric IS NULL OR selected_skill.initial_band >= $4)
    AND ($5::numeric IS NULL OR selected_skill.initial_band <= $5)
`;

// GET: Search and paginate published courses.
async function searchPublishedCourses({
  searchTerm = "",
  skill = null,
  minBand = null,
  maxBand = null,
  page = 1,
  limit = 10,
}) {
  const pattern = `%${escapeLike(searchTerm)}%`;
  const offset = (page - 1) * limit;
  const filterParams = [searchTerm, pattern, skill, minBand, maxBand];

  const [coursesResult, countResult] = await Promise.all([
    pool.query(
      `
        SELECT
          courses.id,
          courses.title,
          courses.slug,
          courses.description,
          courses.thumbnail_url,
          categories.name AS category_name,
          accounts.full_name AS instructor_name,
          selected_skill.initial_band::float8 AS band
        ${FROM_AND_FILTERS}
        ORDER BY
          courses.is_featured DESC,
          courses.published_at DESC NULLS LAST,
          courses.id
        LIMIT $6
        OFFSET $7
      `,
      [...filterParams, limit, offset]
    ),

    pool.query(
      `SELECT COUNT(*) AS total ${FROM_AND_FILTERS}`,
      filterParams
    ),
  ]);

  return {
    courses: coursesResult.rows,
    total: Number(countResult.rows[0].total),
  };
}

// Shared: Find a category by ID.
async function findCategoryById(id) {
  const result = await pool.query(
    "SELECT id FROM categories WHERE id = $1",
    [id]
  );

  return result.rows[0];
}

// Shared: Find a course by ID.
// Includes category and instructor information for the course detail page.
async function findCourseById(id) {
  const sql = `
    SELECT
      courses.*,
      categories.name AS category_name,
      categories.slug AS category_slug,
      accounts.full_name AS instructor_name
    FROM courses
    JOIN categories ON categories.id = courses.category_id
    LEFT JOIN accounts ON accounts.id = courses.instructor_id
    WHERE courses.id = $1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

// Shared: Find a course through a chapter ID.
// Useful for authorization and chapter-related operations.
async function findCourseByChapterId(id) {
  const sql = `
    SELECT courses.id, courses.instructor_id, courses.status
    FROM courses
    JOIN chapters ON chapters.course_id = courses.id
    WHERE chapters.id = $1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

// Shared: Find a course through a lesson ID.
async function findCourseByLessonId(id) {
  const sql = `
    SELECT courses.id, courses.instructor_id, courses.status
    FROM courses
    JOIN chapters ON chapters.course_id = courses.id
    JOIN lessons ON lessons.chapter_id = chapters.id
    WHERE lessons.id = $1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

// POST: Create a course.
async function createCourse(data, instructorId) {
  const sql = `
    INSERT INTO courses (
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', FALSE, NOW(), NOW())
    RETURNING *
  `;

  const values = [
    instructorId,
    data.category_id,
    data.title,
    data.slug,
    data.description,
    data.prerequisite_text,
    data.thumbnail_url,
  ];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

// POST: Create a chapter.
async function createChapter(data) {
  const sql = `
    INSERT INTO chapters (course_id, title, position)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [data.course_id, data.title, data.position];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

// POST: Create a lesson.
async function createLesson(data) {
  const sql = `
    INSERT INTO lessons (
      chapter_id,
      title,
      position,
      is_required,
      required_watch_percentage,
      status,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, 'draft', NOW(), NOW())
    RETURNING *
  `;

  const values = [
    data.chapter_id,
    data.title,
    data.position,
    data.is_required,
    data.required_watch_percentage,
  ];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

// POST: Create a lesson material.
async function createMaterial(data) {
  const sql = `
    INSERT INTO lesson_materials (
      lesson_id,
      title,
      material_type,
      resource_url,
      text_content,
      mime_type,
      duration_seconds,
      is_required,
      position
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    data.lesson_id,
    data.title,
    data.material_type,
    data.resource_url,
    data.text_content,
    data.mime_type,
    data.duration_seconds,
    data.is_required,
    data.position,
  ];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

// GET: Find courses a learner has enrolled in.
async function findCoursesByUserId(userId) {
  const sql = `
    SELECT
      courses.*,
      enrollments.status AS enrollment_status,
      enrollments.enrolled_at,
      enrollments.last_accessed_at,
      enrollments.withdrawn_at,
      enrollments.completed_at
    FROM enrollments
    JOIN courses ON courses.id = enrollments.course_id
    WHERE enrollments.learner_id = $1
    ORDER BY enrollments.enrolled_at DESC, courses.id
  `;

  const result = await pool.query(sql, [userId]);
  return result.rows;
}

// GET: Find chapters belonging to a course.
async function findChaptersByCourseId(courseId) {
  const sql = `
    SELECT *
    FROM chapters
    WHERE course_id = $1
    ORDER BY position, id
  `;

  const result = await pool.query(sql, [courseId]);
  return result.rows;
}

// GET: Find a chapter by ID, including its course information.
async function findChapterById(id) {
  const sql = `
    SELECT
      chapters.*,
      courses.id AS course_id,
      courses.title AS course_title
    FROM chapters
    JOIN courses ON courses.id = chapters.course_id
    WHERE chapters.id = $1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

// GET: Find lessons belonging to a chapter.
async function findLessonsByChapterId(chapterId) {
  const sql = `
    SELECT *
    FROM lessons
    WHERE chapter_id = $1
    ORDER BY position, id
  `;

  const result = await pool.query(sql, [chapterId]);
  return result.rows;
}

// GET: Find a lesson by ID, including its chapter and course information.
async function findLessonById(id) {
  const sql = `
    SELECT
      lessons.*,
      chapters.id AS chapter_id,
      chapters.title AS chapter_title,
      courses.id AS course_id,
      courses.title AS course_title
    FROM lessons
    JOIN chapters ON chapters.id = lessons.chapter_id
    JOIN courses ON courses.id = chapters.course_id
    WHERE lessons.id = $1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

// GET: Find materials belonging to a lesson.
async function findMaterialsByLessonId(lessonId) {
  const sql = `
    SELECT *
    FROM lesson_materials
    WHERE lesson_id = $1
    ORDER BY position, id
  `;

  const result = await pool.query(sql, [lessonId]);
  return result.rows;
}

// GET: Find a material by ID, including its lesson, chapter and course.
async function findMaterialById(id) {
  const sql = `
    SELECT
      lesson_materials.*,
      lessons.id AS lesson_id,
      lessons.title AS lesson_title,
      chapters.id AS chapter_id,
      chapters.title AS chapter_title,
      courses.id AS course_id,
      courses.title AS course_title
    FROM lesson_materials
    JOIN lessons ON lessons.id = lesson_materials.lesson_id
    JOIN chapters ON chapters.id = lessons.chapter_id
    JOIN courses ON courses.id = chapters.course_id
    WHERE lesson_materials.id = $1
  `;

  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

module.exports = {
  // Search and course lookups
  searchPublishedCourses,
  findCategoryById,
  findCourseById,
  findCourseByChapterId,
  findCourseByLessonId,

  // Course creation
  createCourse,
  createChapter,
  createLesson,
  createMaterial,

  // Enrollment queries
  findCoursesByUserId,

  // Chapter queries
  findChaptersByCourseId,
  findChapterById,

  // Lesson queries
  findLessonsByChapterId,
  findLessonById,

  // Material queries
  findMaterialsByLessonId,
  findMaterialById,
};