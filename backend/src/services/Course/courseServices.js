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
 
function parseBand(value) {
    if (value === undefined || value === "") {
        return null;
    }

    if (typeof value !== "string" || !/^\d(\.\d)?$/.test(value)) {
        const error = new Error("Band must be a number such as 6 or 6.5");
        error.statusCode = 400;
        throw error;
    }

    const band = Number(value);

    if (band < 3 || band > 9 || (band * 2) % 1 !== 0) {
        const error = new Error("Band must be between 3.0 and 9.0 in steps of 0.5");
        error.statusCode = 400;
        throw error;
    }

    return band;
}

async function searchCourses({ search, skill, band, page: pageValue, limit: limitValue }) {
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
    const parsedBand = parseBand(band);
    if (parsedBand != null && !parsedSkill) {
        const error = new Error("Band requires a skill");
        error.statusCode = 400;
        throw error;
    }
    const result = await courseModel.searchPublishedCourses({
        searchTerm: normalizedSearchTerm,
        skill: parsedSkill,
        minBand: parsedBand,
        maxBand: parsedBand,
        page,
        limit
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


// GET course

const { positiveId } = require("../../utils/courseUtils");

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
  getMaterial,
  searchCourses,
  createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
