const {
  createError,
  validateBody,
  positiveId,
} = require("../utils/courseUltils");

function validateEnrollment(body) {
  validateBody(body);
  return { course_id: positiveId(body.course_id, "course_id") };
}

function validateResume(body) {
  validateBody(body);
  return { lesson_id: positiveId(body.lesson_id, "lesson_id") };
}

function queryInteger(value, field, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^\d{1,10}$/.test(value)) {
    throw createError(400, `${field} must be a non-negative integer`);
  }
  return Number(value);
}

function validateList(query) {
  let status = null;
  const statuses = ["active", "withdrawn", "completed"];
  if (query.status !== undefined) {
    if (!statuses.includes(query.status)) {
      throw createError(400, "status must be active, withdrawn or completed");
    }
    status = query.status;
  }

  const limit = queryInteger(query.limit, "limit", 20);
  if (limit < 1 || limit > 100) {
    throw createError(400, "limit must be an integer between 1 and 100");
  }

  const offset = queryInteger(query.offset, "offset", 0);
  if (offset > 2147483647) {
    throw createError(
      400,
      "offset must be an integer between 0 and 2147483647",
    );
  }

  return { status, limit, offset };
}

module.exports = { validateEnrollment, validateResume, validateList };
