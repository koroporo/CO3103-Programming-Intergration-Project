const reportModel = require("../../models/Report/reportModel");
const {
  createError,
  validateBody,
  positiveId,
} = require("../../utils/courseUltils");

async function createReport(id, body, user) {
  // check input
  const courseId = positiveId(id, "course_id");
  validateBody(body);

  if (typeof body.reason !== "string" || !body.reason.trim()) {
    throw createError(400, "Reason must be a non-empty string");
  }

  const reason = body.reason.trim();

  if (reason.length > 2000) {
    throw createError(400, "Reason must not exceed 2000 characters");
  }

  // course phai ton tai
  const course = await reportModel.findCourseById(courseId);

  if (!course) {
    throw createError(404, "Course not found");
  }

  // nguoi report phai dang hoc course or complete course
  const enrollment = await reportModel.findEligibleEnrollment(
    courseId,
    user.id,
  );

  if (!enrollment) {
    throw createError(
      403,
      "An active or completed enrollment is required to report this course",
    );
  }

  // khong duoc cung report cho 1 course
  const openReport = await reportModel.findOpenReport(courseId, user.id);

  if (openReport) {
    throw createError(409, "You already have an open report for this course");
  }

  // create report
  try {
    return await reportModel.createReport(courseId, user.id, reason);
  } catch (error) {
    if (
      error.code === "23505" &&
      error.constraint === "uq_content_reports_open_course"
    ) {
      throw createError(
        409,
        "You already have an open report for this course",
      );
    }

    throw error;
  }
}

function parseInteger(value, field, defaultValue, min, max) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw createError(400, `${field} must be an integer`);
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw createError(400, `${field} must be between ${min} and ${max}`);
  }

  return number;
}

async function listReports(id, query, user) {
  const courseId = positiveId(id, "course_id");
  const limit = parseInteger(query.limit, "limit", 20, 1, 100);
  const offset = parseInteger(query.offset, "offset", 0, 0, 2147483647);
  const statuses = ["pending", "reviewing", "resolved", "dismissed"];

  if (query.status !== undefined && !statuses.includes(query.status)) {
    throw createError(400, "Invalid report status");
  }

  const course = await reportModel.findCourseById(courseId);
  if (!course) {
    throw createError(404, "Course not found");
  }

  const isOwner = user.role === "instructor" &&
    String(course.instructor_id) === String(user.id);
  const canViewAll = user.role === "admin" || isOwner;

  const rows = await reportModel.listReports({
    courseId,
    reporterId: canViewAll ? null : user.id,
    status: query.status ?? null,
    limit,
    offset,
  });

  return {
    data: rows.slice(0, limit),
    pagination: {
      limit,
      offset,
      has_more: rows.length > limit,
    },
  };
}

module.exports = {
  createReport,
  listReports,
};
