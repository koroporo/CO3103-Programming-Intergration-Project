
const courseCompletionService = require("../../services/Course/courseCompletionService");
const enrollmentService = require("../../services/Enrollment/enrollmentService");
const { positiveId } = require("../../utils/courseUltils");

async function completeCourse(req, res) {
  const courseId = positiveId(req.body?.courseId, "courseId");
  const score = Number(req.body.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return res.status(400).json({
      message: "Score must be a number between 0 and 100.",
    });
  }

  const result = await courseCompletionService.completeCourse({
    user: req.user,
    courseId,
    score,
  });
  return res.json(result);
}

async function getCompletedCourses(req, res) {
  const { limit, offset } = req.query;
  const { data, pagination } = await enrollmentService.list(
    { status: "completed", limit, offset },
    req.user,
  );
  const courses = data.map(({ course, completed_at }) => ({ ...course, completed_at }));
  return res.json({ courses, pagination });
}

module.exports = {
  completeCourse,
  getCompletedCourses,
};
