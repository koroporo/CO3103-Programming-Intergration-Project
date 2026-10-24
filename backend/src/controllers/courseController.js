const courseService = require("../services/courseService");

async function getCourse(req, res) {
  const course = await courseService.getCourse(req.params.id);

  res.json({
    message: "Course fetched successfully",
    data: course
  });
}

async function getCoursesByUserId(req, res) {
  try {
    if (
      req.user &&
      req.user.role === "learner" &&
      String(req.user.id) !== req.params.user_id
    ) {
      res.status(403).json({ message: "Forbidden: You can only access your own courses" });
      return;
    }

    const courses = await courseService.getCoursesByUserId(req.params.user_id);

    res.status(200).json({
      message: "Courses fetched successfully",
      data: courses
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function getChapters(req, res) {
  const chapters = await courseService.getChapters(req.params.id);

  res.json({
    message: "Chapters fetched successfully",
    data: chapters
  });
}

async function getChapter(req, res) {
  const chapter = await courseService.getChapter(req.params.id);

  res.json({
    message: "Chapter fetched successfully",
    data: chapter
  });
}

async function getLessons(req, res) {
  const lessons = await courseService.getLessons(req.params.id);

  res.json({
    message: "Lessons fetched successfully",
    data: lessons
  });
}

async function getLesson(req, res) {
  const lesson = await courseService.getLesson(req.params.id);

  res.json({
    message: "Lesson fetched successfully",
    data: lesson
  });
}

async function getMaterials(req, res) {
  const materials = await courseService.getMaterials(req.params.id);

  res.json({
    message: "Materials fetched successfully",
    data: materials
  });
}

async function getMaterial(req, res) {
  const material = await courseService.getMaterial(req.params.id);

  res.json({
    message: "Material fetched successfully",
    data: material
  });
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
