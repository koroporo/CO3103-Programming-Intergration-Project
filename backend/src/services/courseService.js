const courseModel = require("../models/courseModel");
const { createError, positiveId } = require("../utils/courseUtils");

async function getCourse(id) {
  const courseId = positiveId(id, "course_id");
  const course = await courseModel.findCourseById(courseId);

  if (!course) {
    throw createError(404, "Course not found");
  }

  return course;
}

async function getCoursesByUserId(id) {
  const userId = positiveId(id, "user_id");
  return courseModel.findCoursesByUserId(userId);
}

async function getChapters(id) {
  const courseId = positiveId(id, "course_id");
  const course = await courseModel.findCourseById(courseId);

  if (!course) {
    throw createError(404, "Course not found");
  }

  return courseModel.findChaptersByCourseId(courseId);
}

async function getChapter(id) {
  const chapterId = positiveId(id, "chapter_id");
  const chapter = await courseModel.findChapterById(chapterId);

  if (!chapter) {
    throw createError(404, "Chapter not found");
  }

  return chapter;
}

async function getLessons(id) {
  const chapterId = positiveId(id, "chapter_id");
  const chapter = await courseModel.findChapterById(chapterId);

  if (!chapter) {
    throw createError(404, "Chapter not found");
  }

  return courseModel.findLessonsByChapterId(chapterId);
}

async function getLesson(id) {
  const lessonId = positiveId(id, "lesson_id");
  const lesson = await courseModel.findLessonById(lessonId);

  if (!lesson) {
    throw createError(404, "Lesson not found");
  }

  return lesson;
}

async function getMaterials(id) {
  const lessonId = positiveId(id, "lesson_id");
  const lesson = await courseModel.findLessonById(lessonId);

  if (!lesson) {
    throw createError(404, "Lesson not found");
  }

  return courseModel.findMaterialsByLessonId(lessonId);
}

async function getMaterial(id) {
  const materialId = positiveId(id, "material_id");
  const material = await courseModel.findMaterialById(materialId);

  if (!material) {
    throw createError(404, "Material not found");
  }

  return material;
}

module.exports = {
  getCourse,
  getCoursesByUserId,
  getChapters,
  getChapter,
  getLessons,
  getLesson,
  getMaterials,
  getMaterial
};
