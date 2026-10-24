const courseModel = require("../../models/Course/courseMode(unused)");
const {
  createError,
  validateCourse,
  validateChapter,
  validateLesson,
  validateMaterial,
  assertCourseOwner,
} = require("../../utils/courseUltils");

async function createCourse(body, user) {
  // bước 1 kiểm tra và lấy các metric được phép từ body.
  const data = validateCourse(body);

  // bước 2 category phải tồn tại trước khi tạo course thuộc category đó
  const category = await courseModel.findCategoryById(data.category_id);
  if (!category) {
    throw createError(404, "Category not found");
  }

  // bước 3 chủ khóa học lấy từ tài khoản đã xác thực, không lấy từ body.
  const createdCourse = await courseModel.createCourse(data, user.id);
  return createdCourse;
}

async function createChapter(body, user) {
  const data = validateChapter(body);

  // tìm course cha rồi kiểm tra giảng viên đang gọi API có sở hữu nó không.
  const course = await courseModel.findCourseById(data.course_id);
  assertCourseOwner(course, user);

  const createdChapter = await courseModel.createChapter(data);
  return createdChapter;
}

async function createLesson(body, user) {
  const data = validateLesson(body);
  const course = await courseModel.findCourseByChapterId(data.chapter_id);
  assertCourseOwner(course, user);

  const createdLesson = await courseModel.createLesson(data);
  return createdLesson;
}

async function createMaterial(body, user) {
  const data = validateMaterial(body);

  const course = await courseModel.findCourseByLessonId(data.lesson_id);
  assertCourseOwner(course, user);

  const createdMaterial = await courseModel.createMaterial(data);
  return createdMaterial;
}

module.exports = {
  createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
