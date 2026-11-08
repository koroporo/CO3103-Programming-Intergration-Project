const { randomUUID } = require("node:crypto");
const notificationModel = require("../../models/Notification/notificationModel");
const { createError, positiveId } = require("../../utils/courseUtils");

const types = new Set(["new_content", "deadline", "result", "moderation", "weekly_test"]);

function textField(value, name, maxLength = Infinity) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0")) {
    throw createError(400, name + " must contain valid text");
  }
  const text = value.trim();
  if (Array.from(text).length > maxLength) {
    throw createError(400, name + " is too long");
  }
  return text;
}

function list(recipientId) {
  return notificationModel.listByRecipient(recipientId);
}

async function create(data) {
  if (!types.has(data?.notification_type)) {
    throw createError(400, "Invalid notification_type");
  }
  const notification = {
    recipient_id: positiveId(data.recipient_id, "recipient_id"),
    notification_type: data.notification_type,
    title: textField(data.title, "title", 250),
    body: textField(data.body, "body"),
    dedupe_key: textField(data.dedupe_key ?? randomUUID(), "dedupe_key", 200)
  };
  for (const field of ["course_id", "lesson_id", "assessment_id"]) {
    notification[field] = data[field] == null ? null : positiveId(data[field], field);
  }
  const created = await notificationModel.insert(notification);
  if (!created) {
    throw createError(409, "This notification already exists for the recipient");
  }
  return created;
}

module.exports = { list, create };
