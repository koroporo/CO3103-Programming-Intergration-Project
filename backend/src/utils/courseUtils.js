function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function positiveId(value, field) {
  const errorMessage = `${field} must be a positive PostgreSQL BIGINT`;

  if (typeof value !== "string" && typeof value !== "number") {
    throw createError(400, errorMessage);
  }

  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw createError(400, `${field} must be a positive integer (use a string for BIGINT)`);
  }

  const id = String(value);
  if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
    throw createError(400, errorMessage);
  }

  return id;
}

module.exports = {
  createError,
  positiveId
};
