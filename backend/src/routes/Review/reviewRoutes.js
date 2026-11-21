const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/Review/reviewController");
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const { authorizeRoles } = require("../../middleware/Authentication/roleMiddleware");

router.get("/:courseId/reviews", reviewController.getReviews);

router.post(
  "/:courseId/reviews",
  authenticate,
  authorizeRoles("learner", "user"),
  reviewController.postReview
);

module.exports = router;