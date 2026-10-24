const pool = require("../db");

async function findCourseById(id) {
  const sql = `
    SELECT courses.*, categories.name AS category_name, categories.slug AS category_slug
    FROM courses
    JOIN categories ON categories.id = courses.category_id
    WHERE courses.id = $1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

async function findCoursesByUserId(userId) {
  const sql = `
    SELECT courses.*, enrollments.status AS enrollment_status,
      enrollments.enrolled_at, enrollments.last_accessed_at,
      enrollments.withdrawn_at, enrollments.completed_at
    FROM enrollments
    JOIN courses ON courses.id = enrollments.course_id
    WHERE enrollments.learner_id = $1
    ORDER BY enrollments.enrolled_at DESC, courses.id
  `;
  const result = await pool.query(sql, [userId]);
  return result.rows;
}

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

async function findChapterById(id) {
  const sql = `
    SELECT chapters.*, courses.id AS course_id, courses.title AS course_title
    FROM chapters
    JOIN courses ON courses.id = chapters.course_id
    WHERE chapters.id = $1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

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

async function findLessonById(id) {
  const sql = `
    SELECT lessons.*, chapters.id AS chapter_id, chapters.title AS chapter_title,
      courses.id AS course_id, courses.title AS course_title
    FROM lessons
    JOIN chapters ON chapters.id = lessons.chapter_id
    JOIN courses ON courses.id = chapters.course_id
    WHERE lessons.id = $1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

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

async function findMaterialById(id) {
  const sql = `
    SELECT lesson_materials.*, lessons.id AS lesson_id, lessons.title AS lesson_title,
      chapters.id AS chapter_id, chapters.title AS chapter_title,
      courses.id AS course_id, courses.title AS course_title
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
  findCourseById,
  findCoursesByUserId,
  findChaptersByCourseId,
  findChapterById,
  findLessonsByChapterId,
  findLessonById,
  findMaterialsByLessonId,
  findMaterialById
};
