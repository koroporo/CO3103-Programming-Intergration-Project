const notificationService = require("../../services/Notification/notificationService");

async function list(req, res) {
  const notifications = await notificationService.list(req.user.id);
  res.json({ notifications });
}

async function create(req, res) {
  const notification = await notificationService.create(req.body);
  res.status(201).json({ notification });
}

module.exports = { list, create };
