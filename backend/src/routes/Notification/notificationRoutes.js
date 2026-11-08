const router = require("express").Router();
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const { authorizeRoles } = require("../../middleware/Authentication/roleMiddleware");
const { list, create } = require("../../controllers/Notification/notificationController");

router.get("/get", authenticate, list);
router.post("/post", authenticate, authorizeRoles("admin"), create);

module.exports = router;
