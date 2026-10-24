const pool = require("../../db");

function escapeLike(text) {
  return text.replace(/[\\%_]/g, "\\$&");
}
const FROM_AND_FILTERS = `
    FROM courses
    JOIN categories ON categories.id = courses.category_id
    JOIN accounts ON accounts.id = courses.instructor_id
    LEFT JOIN course_skills AS selected_skill
        ON selected_skill.course_id = courses.id
       AND selected_skill.skill_id = (SELECT id FROM skills WHERE code = $3::text)
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
async function searchPublishedCourses({
  searchTerm,
  skill,
  minBand,
  maxBand,
  page,
  limit,
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
            ORDER BY courses.is_featured DESC, courses.published_at DESC NULLS LAST, courses.id
            LIMIT $6
            OFFSET $7
            `,
      [...filterParams, limit, offset],
    ),
    pool.query(`SELECT COUNT(*) AS total ${FROM_AND_FILTERS}`, filterParams),
  ]);

  return {
    courses: coursesResult.rows,
    total: Number(countResult.rows[0].total),
  };
}
async function findCategoryById(id) {
  const sql = "SELECT id FROM categories WHERE id = $1";
  const values = [id];

  const result = await pool.query(sql, values);
  // rows là mảng các dòng tìm được; rows[0] là dòng đầu, hoặc undefined nếu không có
  return result.rows[0];
}

async function findCourseById(id) {
  const sql = "SELECT id, instructor_id, status FROM courses WHERE id = $1";
  const values = [id];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function findCourseByChapterId(id) {
  const sql = `
    SELECT courses.id, courses.instructor_id, courses.status
    FROM courses
    JOIN chapters ON chapters.course_id = courses.id
    WHERE chapters.id = $1
  `;
  const values = [id];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function findCourseByLessonId(id) {
  // từ lesson đi qua chapter để tìm course chứa lesson đó.
  const sql = `
    SELECT courses.id, courses.instructor_id, courses.status
    FROM courses
    JOIN chapters ON chapters.course_id = courses.id
    JOIN lessons ON lessons.chapter_id = chapters.id
    WHERE lessons.id = $1
  `;
  const values = [id];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function createCourse(data, instructorId) {
  const sql = `
    INSERT INTO courses (
      instructor_id, category_id, title, slug, description, prerequisite_text,
      thumbnail_url, status, is_featured, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', FALSE, NOW(), NOW())
    RETURNING *
  `;
  const values = [
    instructorId, // $1
    data.category_id, // $2
    data.title, // $3
    data.slug, // $4
    data.description, // $5
    data.prerequisite_text, // $6
    data.thumbnail_url, // $7
  ];

  const result = await pool.query(sql, values);
  // RETURNING * yêu cầu PostgreSQL trả lại bản ghi vừa tạo, gồm cả ID mới
  return result.rows[0];
}

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

async function createLesson(data) {
  const sql = `
    INSERT INTO lessons (
      chapter_id, title, position, is_required, required_watch_percentage,
      status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, 'draft', NOW(), NOW())
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

async function createMaterial(data) {
  const sql = `
    INSERT INTO lesson_materials (
      lesson_id, title, material_type, resource_url, text_content,
      mime_type, duration_seconds, is_required, position
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

module.exports = {
  searchPublishedCourses,
  findCategoryById,
  findCourseById,
  findCourseByChapterId,
  findCourseByLessonId,
  createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
