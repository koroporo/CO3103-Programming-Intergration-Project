
const courseCompletionService = require("../../services/Course/courseCompletionService");

async function completeCourse(req, res) {
  try {
    // Adjust this if your authentication middleware uses another property.
    const userId =
      req.user?.id ??
      req.user?.userId ??
      req.user?.accountId;

    if (!userId) {
      return res.status(401).json({
        message: "Unable to identify the authenticated user.",
      });
    }

    const courseId = Number(req.body.courseId);
    const score = Number(req.body.score);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        message: "A valid courseId is required.",
      });
    }

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({
        message: "Score must be a number between 0 and 100.",
      });
    }

    const result = await courseCompletionService.completeCourse({
      userId,
      courseId,
      score,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Course completion error:", error);

    return res.status(500).json({
      message: "Failed to process course completion.",
    });
  }
}

module.exports = {
  completeCourse,
};
