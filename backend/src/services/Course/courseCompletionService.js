
const courseCompletionModel = require("../../models/Course/courseCompletionModel");
const enrollmentModel = require("../../models/Enrollment/enrollmentModel");
const { createError } = require("../../utils/courseUltils");

async function completeCourse({ user, courseId, score }) {
  return enrollmentModel.withTransaction(async (client) => {
    const enrollment = await enrollmentModel.findByCourse(client, user.id, courseId);
    if (!enrollment) {
      throw createError(404, "Enrollment not found.");
    }

    if (enrollment.status === "active") {
      const completed = await enrollmentModel.completeEnrollment(client, enrollment.id);
      await enrollmentModel.createAudit(client, user, "complete_course", enrollment, completed);
    } else if (enrollment.status !== "completed") {
      throw createError(409, "Only active enrollments can be completed.");
    }

    const eligible = score > 80;
    const recommendations = eligible
      ? await courseCompletionModel.getRecommendations(client, user.id, courseId)
      : [];

    return {
      eligible,
      message: eligible
        ? "Course completed successfully. Here are your recommendations."
        : "Course completed. A score above 80 is required for personalized recommendations.",
      score,
      recommendations,
    };
  });
}

module.exports = {
  completeCourse,
};
