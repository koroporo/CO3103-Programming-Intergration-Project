const discussionModel = require("../../models/Discussion/discussionModel");
const model = require("../../models/Notification/notificationModel");
const { createError, positiveId, pageQuery, page } = require("../../utils/discussionUtils");

function withRecipient(user, work) {
  return discussionModel.withTransaction(async (client) => {
    const actor = await discussionModel.findActor(client, user.id);
    if (!actor || actor.status !== "active") throw createError(403, "An active account is required");
    return work(client, actor.id);
  });
}

function list(query, user) {
  const pagination = pageQuery(query);
  if (query.unread !== undefined && !["true", "false"].includes(query.unread)) {
    throw createError(400, "unread must be true or false");
  }
  return withRecipient(user, async (client, id) => {
    const result = page(await model.listByRecipient(client, id, { ...pagination, unread: query.unread === "true" }), pagination);
    return { notifications: result.data, pagination: result.pagination, unread_count: await model.unreadCount(client, id) };
  });
}

function markRead(notificationId, user) {
  const id = positiveId(notificationId, "notification_id");
  return withRecipient(user, async (client, recipient) => {
    const notification = await model.markRead(client, recipient, id);
    if (!notification) throw createError(404, "Notification not found");
    return notification;
  });
}

function markAllRead(user) {
  return withRecipient(user, (client, recipient) => model.markAllRead(client, recipient));
}

module.exports = { list, markRead, markAllRead };
