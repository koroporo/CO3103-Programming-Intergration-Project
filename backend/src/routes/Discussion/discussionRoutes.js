const router = require("express").Router({ mergeParams: true });
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const controller = require("../../controllers/Discussion/discussionController");

router.use(authenticate);
router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:discussionId/replies", controller.replies);
router.post("/:discussionId/replies", controller.create);
router.get("/:discussionId", controller.get);
router.patch("/:discussionId", controller.edit);
router.delete("/:discussionId", controller.remove);

module.exports = router;
