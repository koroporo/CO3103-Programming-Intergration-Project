const { createError, positiveId, validateBody } = require("./courseUltils");

function contentText(value) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0")) {
    throw createError(400, "content must be non-empty text");
  }
  const content = value.trim();
  if (Array.from(content).length > 10000) {
    throw createError(400, "content must not exceed 10000 characters");
  }
  return content;
}

function pageQuery(query) {
  const result = {};
  for (const [field, fallback, minimum, maximum] of [
    ["limit", 20, 1, 100], ["offset", 0, 0, 2147483647],
  ]) {
    const value = query[field];
    if (value === undefined) result[field] = fallback;
    else if (typeof value !== "string" || !/^\d{1,10}$/.test(value)
      || Number(value) < minimum || Number(value) > maximum) {
      throw createError(400, `${field} must be an integer between ${minimum} and ${maximum}`);
    } else result[field] = Number(value);
  }
  return result;
}

function postBody(body) {
  validateBody(body);
  return { content: contentText(body.content) };
}

function patchBody(body) {
  validateBody(body);
  const fields = Object.keys(body);
  if (!fields.length || fields.some((key) => !["content", "is_resolved", "is_pinned"].includes(key))) {
    throw createError(400, "Only content, is_resolved and is_pinned may be updated");
  }
  const result = {};
  if (Object.hasOwn(body, "content")) result.content = contentText(body.content);
  for (const field of ["is_resolved", "is_pinned"]) {
    if (Object.hasOwn(body, field)) {
      if (typeof body[field] !== "boolean") throw createError(400, `${field} must be a boolean`);
      result[field] = body[field];
    }
  }
  return result;
}

function page(rows, pagination) {
  return { data: rows.slice(0, pagination.limit), pagination: {
    ...pagination, has_more: rows.length > pagination.limit,
  } };
}

module.exports = { createError, positiveId, contentText, pageQuery, postBody, patchBody, page };
