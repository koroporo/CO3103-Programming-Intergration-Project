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


module.exports = {
    searchCourses,
    createCourse,
  createChapter,
  createLesson,
  createMaterial,
};
