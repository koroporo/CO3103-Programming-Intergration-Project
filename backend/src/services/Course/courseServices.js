const courseModel = require("../../models/Course/courseModels");

const {
  createError,
  validateCourse,
  validateChapter,
  validateLesson,
  validateMaterial,
  assertCourseOwner,
} = require("../../utils/courseUltils");

const SKILLS = ["listening", "reading", "writing", "speaking"];
const LEVEL_BANDS = {
  a1: { minBand: 0, maxBand: 2.5 },
  a2: { minBand: 3, maxBand: 3.5 },
  b1: { minBand: 4, maxBand: 5 },
  b2: { minBand: 5.5, maxBand: 6.5 },
  c1: { minBand: 7, maxBand: 8 },
  c2: { minBand: 8.5, maxBand: 9 },
};

function parsePositiveInteger(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    const error = new Error("Page and limit must be positive integers");
    error.statusCode = 400;
    throw error;
  }

  const parsedValue = Number(value);

  if (!Number.isSafeInteger(parsedValue)) {
    const error = new Error("Page and limit must be safe integers");
    error.statusCode = 400;
    throw error;
  }

  return parsedValue;
}

function parseSkill(value) {
  if (value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string" || !SKILLS.includes(value.toLowerCase())) {
    const error = new Error(`Skill must be one of: ${SKILLS.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  return value.toLowerCase();
}

function parseLevel(value) {
  if (value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string" || !(value.toLowerCase() in LEVEL_BANDS)) {
    const error = new Error(
      `Level must be one of: ${Object.keys(LEVEL_BANDS).join(", ")}`,
    );
    error.statusCode = 400;
    throw error;
  }

  return value.toLowerCase();
}

async function searchCourses({
  search,
  skill,
  level,
  page: pageValue,
  limit: limitValue,
}) {
  if (typeof search !== "string") {
    const error = new Error("The search query must be a single string");
    error.statusCode = 400;
    throw error;
  }

  const normalizedSearchTerm = search.trim();

  if (normalizedSearchTerm.length > 100) {
    const error = new Error("Search term must be 100 characters or fewer");
    error.statusCode = 400;
    throw error;
  }

  const page = parsePositiveInteger(pageValue, 1);
  const limit = parsePositiveInteger(limitValue, 20);

  if (limit > 50) {
    const error = new Error("Limit must not exceed 50");
    error.statusCode = 400;
    throw error;
  }

  if ((page - 1) * limit > Number.MAX_SAFE_INTEGER) {
    const error = new Error("The requested page is too large");
    error.statusCode = 400;
    throw error;
  }
  const parsedSkill = parseSkill(skill);
  const parsedLevel = parseLevel(level);
  if (parsedLevel && !parsedSkill) {
    const error = new Error("Level requires a skill");
    error.statusCode = 400;
    throw error;
  }
  let bands;
  if (parsedLevel) {
    bands = LEVEL_BANDS[parsedLevel];
  } else {
    bands = { minBand: null, maxBand: null };
  }
  const result = await courseModel.searchPublishedCourses({
    searchTerm: normalizedSearchTerm,
    skill: parsedSkill,
    minBand: bands.minBand,
    maxBand: bands.maxBand,
    page,
    limit,
  });

  return {
    ...result,
    page,
    limit,
  };
}

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
  searchCourses,
  createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
