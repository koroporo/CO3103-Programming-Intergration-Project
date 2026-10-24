const pool = require("../db");

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
    instructorId,             // $1
    data.category_id,         // $2
    data.title,               // $3
    data.slug,                // $4
    data.description,         // $5
    data.prerequisite_text,   // $6
    data.thumbnail_url        // $7
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
    data.required_watch_percentage
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
    data.position
  ];

  const result = await pool.query(sql, values);
  return result.rows[0];
}

module.exports = {
  findCategoryById,
  findCourseById,
  findCourseByChapterId,
  findCourseByLessonId,
  createCourse,
  createChapter,
  createLesson,
  createMaterial
};
