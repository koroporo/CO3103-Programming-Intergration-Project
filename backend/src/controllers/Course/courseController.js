const courseService = require("../../services/Course/courseService");

async function createCourse(req, res) {
  const createdCourse = await courseService.createCourse(req.body, req.user);

  res.status(201).json({
    message: "Course created successfully",
    data: createdCourse,
  });
}

async function createChapter(req, res) {
  const createdChapter = await courseService.createChapter(req.body, req.user);

  res.status(201).json({
    message: "Chapter created successfully",
    data: createdChapter,
  });
}

async function createLesson(req, res) {
  const createdLesson = await courseService.createLesson(req.body, req.user);

  res.status(201).json({
    message: "Lesson created successfully",
    data: createdLesson,
  });
}

async function createMaterial(req, res) {
  const createdMaterial = await courseService.createMaterial(
    req.body,
    req.user,
  );

  res.status(201).json({
    message: "Material created successfully",
    data: createdMaterial,
  });
}

module.exports = {
  createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
