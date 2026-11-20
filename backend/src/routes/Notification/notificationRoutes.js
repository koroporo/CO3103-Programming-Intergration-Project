const router = require("express").Router();
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const service = require("../../services/Notification/notificationService");

router.use(authenticate);
router.get("/get", async (req, res) => {
  res.json(await service.list(req.query, req.user));
});
router.patch("/read-all", async (req, res) => {
  await service.markAllRead(req.user);
  res.status(204).end();
});
router.patch("/:id/read", async (req, res) => {
  res.json({ notification: await service.markRead(req.params.id, req.user) });
});

module.exports = router;
