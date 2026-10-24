const { randomUUID } = require("node:crypto");

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError(400, "Request body must be a JSON object");
  }
}

function requiredText(value, field, maxLength) {
  if (typeof value !== "string" || !value.trim()) {
    throw createError(400, `${field} is required and must be a non-empty string`);
  }
  const text = value.trim();
  if (maxLength && text.length > maxLength) {
    throw createError(400, `${field} must not exceed ${maxLength} characters`);
  }
  return text;
}

function optionalText(value, field, maxLength) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return requiredText(value, field, maxLength);
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
  const containsOnlyPositiveDigits = /^[1-9]\d{0,18}$/.test(id);
  if (!containsOnlyPositiveDigits) {
    throw createError(400, errorMessage);
  }

  const maximumDatabaseId = 9223372036854775807n;
  if (BigInt(id) > maximumDatabaseId) {
    throw createError(400, errorMessage);
  }

  return id;
}

function positiveInteger(value, field) {
  if (!Number.isInteger(value) || value < 1 || value > 2147483647) {
    throw createError(400, `${field} must be a positive PostgreSQL integer`);
  }
  return value;
}

function booleanValue(value, field, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value !== "boolean") {
    throw createError(400, `${field} must be a boolean`);
  }
  return value;
}

function resourceLocation(value, field, required = false) {
  let location;
  if (required) {
    location = requiredText(value, field);
  } else {
    location = optionalText(value, field);
  }

  if (location === null) {
    return null;
  }

  if (/\s/.test(location) || location.startsWith("//")) {
    throw createError(400, `${field} must be an HTTP(S) URL or an object key`);
  }
  if (location.includes(":")) {
    let url;
    try {
      url = new URL(location);
    } catch {
      throw createError(400, `${field} must be an HTTP(S) URL or an object key`);
    }

    const isHttpUrl = url.protocol === "http:" || url.protocol === "https:";
    if (!isHttpUrl || !url.hostname) {
      throw createError(400, `${field} must be an HTTP(S) URL or an object key`);
    }
  }
  return location;
}

function courseSlug(value, title) {
  if (value !== undefined) {
    const slug = requiredText(value, "slug", 280);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw createError(400, "slug must contain lowercase letters, numbers and single hyphens");
    }
    return slug;
  }

  let base = title.normalize("NFD");
  base = base.replace(/[\u0300-\u036f]/g, "");
  base = base.replace(/[đĐ]/g, "d");
  base = base.toLowerCase();
  base = base.replace(/[^a-z0-9]+/g, "-");
  base = base.replace(/^-|-$/g, "");
  base = base.slice(0, 240).replace(/-$/, "");

  if (base === "") {
    base = "course";
  }

  return `${base}-${randomUUID()}`;
}

function validateCourse(body) {
  validateBody(body);
  const title = requiredText(body.title, "title", 250);
  return {
    category_id: positiveId(body.category_id, "category_id"),
    title,
    slug: courseSlug(body.slug, title),
    description: requiredText(body.description, "description"),
    prerequisite_text: optionalText(body.prerequisite_text, "prerequisite_text"),
    thumbnail_url: resourceLocation(body.thumbnail_url, "thumbnail_url")
  };
}

function validateChapter(body) {
  validateBody(body);
  return {
    course_id: positiveId(body.course_id, "course_id"),
    title: requiredText(body.title, "title", 250),
    position: positiveInteger(body.position, "position")
  };
}

function watchPercentage(value) {
  let percentage = 80;
  if (value !== undefined) {
    percentage = value;
  }

  const errorMessage = "required_watch_percentage must be > 0 and <= 100, with at most 2 decimal places";
  if (typeof percentage !== "number" || !Number.isFinite(percentage)) {
    throw createError(400, errorMessage);
  }
  if (percentage <= 0 || percentage > 100) {
    throw createError(400, errorMessage);
  }

  const scaledPercentage = percentage * 100;
  const roundingDifference = Math.abs(scaledPercentage - Math.round(scaledPercentage));
  if (roundingDifference > 0.00000001) {
    throw createError(400, errorMessage);
  }
  return percentage;
}

function validateLesson(body) {
  validateBody(body);

  return {
    chapter_id: positiveId(body.chapter_id, "chapter_id"),
    title: requiredText(body.title, "title", 250),
    position: positiveInteger(body.position, "position"),
    is_required: booleanValue(body.is_required, "is_required", true),
    required_watch_percentage: watchPercentage(body.required_watch_percentage)
  };
}

function validateMaterial(body) {
  validateBody(body);

  const allowedMaterialTypes = ["text", "audio", "slides", "file"];
  if (!allowedMaterialTypes.includes(body.material_type)) {
    throw createError(400, "material_type must be text, audio, slides or file; video uses the videos table");
  }
  const isText = body.material_type === "text";

  let resourceUrl;
  let textContent = null;
  if (isText) {
    textContent = requiredText(body.text_content, "text_content");
    resourceUrl = resourceLocation(body.resource_url, "resource_url");
  } else {
    resourceUrl = resourceLocation(body.resource_url, "resource_url", true);
  }

  let duration = null;
  if (body.duration_seconds !== undefined && body.duration_seconds !== null) {
    if (body.material_type !== "audio") {
      throw createError(400, "duration_seconds is only supported for audio materials");
    }
    duration = positiveInteger(body.duration_seconds, "duration_seconds");
  }
  return {
    lesson_id: positiveId(body.lesson_id, "lesson_id"),
    title: requiredText(body.title, "title", 250),
    material_type: body.material_type,
    resource_url: resourceUrl,
    text_content: textContent,
    mime_type: optionalText(body.mime_type, "mime_type", 120),
    duration_seconds: duration,
    is_required: booleanValue(body.is_required, "is_required", true),
    position: positiveInteger(body.position, "position")
  };
}

function assertCourseOwner(course, user) {
  if (!course) {
    throw createError(404, "Course, chapter or lesson not found");
  }

  if (String(course.instructor_id) !== String(user.id)) {
    throw createError(403, "You can only add content to your own course");
  }
  if (["hidden", "archived"].includes(course.status)) {
    throw createError(409, "Cannot add content to a hidden or archived course");
  }
}

module.exports = {
  createError,
  validateBody,
  positiveId,
  validateCourse,
  validateChapter,
  validateLesson,
  validateMaterial,
  assertCourseOwner
};
