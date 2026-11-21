const reviewService = require("../../services/Review/reviewService");

async function getReviews(req, res) {
  const result = await reviewService.getCourseReviews(req.params.courseId);
  res.status(200).json(result);
}

async function postReview(req, res) {
  const review = await reviewService.createCourseReview(
    req.params.courseId,
    req.body,
    req.user
  );
  res.status(201).json({
    message: "Review submitted successfully",
    review,
  });
}

module.exports = {
  getReviews,
  postReview,
};