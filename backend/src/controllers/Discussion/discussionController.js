const service = require("../../services/Discussion/discussionService");

async function list(req, res) {
  res.json(await service.list(req.params.lessonId, req.query, req.user));
}
async function get(req, res) {
  res.json({ data: await service.get(req.params.lessonId, req.params.discussionId, req.user) });
}
async function replies(req, res) {
  res.json(await service.replies(req.params.lessonId, req.params.discussionId, req.query, req.user));
}
async function create(req, res) {
  res.status(201).json({ data: await service.create(req.params.lessonId, req.params.discussionId, req.body, req.user) });
}
async function edit(req, res) {
  res.json({ data: await service.edit(req.params.lessonId, req.params.discussionId, req.body, req.user) });
}
async function remove(req, res) {
  await service.remove(req.params.lessonId, req.params.discussionId, req.user);
  res.status(204).end();
}

module.exports = { list, get, replies, create, edit, remove };
