const reviewModel = require("../../models/Review/reviewModel");

const ALLOWED_DIFFICULTIES = ["too_easy", "appropriate", "too_hard"];

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseCourseId(rawCourseId) {
  const value = String(rawCourseId ?? "").trim();
  if (!/^[1-9]\d*$/.test(value)) {
    throw createHttpError(400, "Invalid course ID");
  }
  return value;
}

function validateReviewPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw createHttpError(400, "Request body is required");
  }

  const rawRating = payload.rating ?? payload.star_rating;
  const starRating = Number(rawRating);
  if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
    throw createHttpError(400, "Rating must be an integer between 1 and 5");
  }

  const perceivedDifficulty = payload.perceived_difficulty ?? "appropriate";
  if (!ALLOWED_DIFFICULTIES.includes(perceivedDifficulty)) {
    throw createHttpError(
      400,
      "Perceived difficulty must be one of: too_easy, appropriate, too_hard"
    );
  }

  let comment = null;
  if (payload.comment !== undefined && payload.comment !== null) {
    if (typeof payload.comment !== "string") {
      throw createHttpError(400, "Comment must be a string");
    }
    const trimmed = payload.comment.trim();
    if (trimmed.length > 2000) {
      throw createHttpError(400, "Comment must not exceed 2000 characters");
    }
    comment = trimmed.length > 0 ? trimmed : null;
  }

  return {
    starRating,
    perceivedDifficulty,
    comment,
  };
}

async function getCourseReviews(rawCourseId) {
  const courseId = parseCourseId(rawCourseId);
  const course = await reviewModel.findCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  const [reviews, stats] = await Promise.all([
    reviewModel.listVisibleByCourseId(courseId),
    reviewModel.getCourseReviewStats(courseId),
  ]);

  return {
    reviews,
    total_reviews: stats.total_reviews,
    average_rating: stats.average_rating,
  };
}

async function createCourseReview(rawCourseId, payload, user) {
  const courseId = parseCourseId(rawCourseId);
  const validated = validateReviewPayload(payload);

  const course = await reviewModel.findCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  const enrollment = await reviewModel.findEnrollment(user.id, courseId);
  if (!enrollment || !["active", "completed"].includes(enrollment.status)) {
    throw createHttpError(403, "You must be enrolled in this course to submit a review");
  }

  const existingReview = await reviewModel.findReviewByEnrollmentId(enrollment.id);
  if (existingReview) {
    throw createHttpError(409, "You have already reviewed this course");
  }

  try {
    return await reviewModel.createReview({
      enrollmentId: enrollment.id,
      starRating: validated.starRating,
      perceivedDifficulty: validated.perceivedDifficulty,
      comment: validated.comment,
    });
  } catch (error) {
    if (error.code === "23505") {
      throw createHttpError(409, "You have already reviewed this course");
    }
    throw error;
  }
}

module.exports = {
  getCourseReviews,
  createCourseReview,
};