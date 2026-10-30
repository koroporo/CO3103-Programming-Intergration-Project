
const courseCompletionModel = require("../../models/Course/courseCompletionModel");

async function completeCourse({ userId, courseId, score }) {
  if (score <= 80) {
    return {
      eligible: false,
      message: "A score above 80 is required for personalized recommendations.",
      score,
      recommendations: [],
    };
  }

  const recommendations =
    await courseCompletionModel.getRecommendations(userId, courseId);

  return {
    eligible: true,
    message: "Course completed successfully. Here are your recommendations.",
    score,
    recommendations,
  };
}

module.exports = {
  completeCourse,
};
