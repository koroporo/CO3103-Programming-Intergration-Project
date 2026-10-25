const courseService = require("../../services/Course/courseServices");

async function searchCourses(req, res) {
    try {
        const result = await courseService.searchCourses({
            search: req.query.search ?? "",
            skill: req.query.skill,
            level: req.query.level,
            page: req.query.page,
            limit: req.query.limit
        });
        return res.json(result);
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ error: error.message });
        }

        console.error("Failed to search courses:", error);
        return res.status(500).json({ error: "Failed to search courses" });
    }
}
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
 
// GET course

async function getCourse(req, res) {
  const course = await courseService.getCourse(req.params.id);

  res.json({
    message: "Course fetched successfully",
    data: course,
  });
}

async function getCoursesByUserId(req, res) {
  try {
    if (
      req.user &&
      req.user.role === "learner" &&
      String(req.user.id) !== req.params.user_id
    ) {
      res
        .status(403)
        .json({ message: "Forbidden: You can only access your own courses" });
      return;
    }

    const courses = await courseService.getCoursesByUserId(req.params.user_id);

    res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function getChapters(req, res) {
  const chapters = await courseService.getChapters(req.params.id);

  res.json({
    message: "Chapters fetched successfully",
    data: chapters,
  });
}

async function getChapter(req, res) {
  const chapter = await courseService.getChapter(req.params.id);

  res.json({
    message: "Chapter fetched successfully",
    data: chapter,
  });
}

async function getLessons(req, res) {
  const lessons = await courseService.getLessons(req.params.id);

  res.json({
    message: "Lessons fetched successfully",
    data: lessons,
  });
}

async function getLesson(req, res) {
  const lesson = await courseService.getLesson(req.params.id);

  res.json({
    message: "Lesson fetched successfully",
    data: lesson,
  });
}

async function getMaterials(req, res) {
  const materials = await courseService.getMaterials(req.params.id);

  res.json({
    message: "Materials fetched successfully",
    data: materials,
  });
}

async function getMaterial(req, res) {
  const material = await courseService.getMaterial(req.params.id);

  res.json({
    message: "Material fetched successfully",
    data: material,
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
  getMaterial,
  searchCourses,
  createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
