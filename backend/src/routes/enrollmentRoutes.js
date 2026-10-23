const express = require("express");
const enrollmentController = require("../controllers/enrollmentController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(authenticate, authorizeRoles("learner"));

router.post("/post", enrollmentController.enroll);
router.get("/get", enrollmentController.list);
router.get("/get/:id", enrollmentController.getById);
router.patch("/withdraw/:id", enrollmentController.withdraw);
router.patch("/resume/:id", enrollmentController.resume);

module.exports = router;
