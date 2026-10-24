const express = require("express");
const enrollmentController = require("../../controllers/Enrollment/enrollmentController");
const {
  authenticate,
} = require("../../middleware/Authentication/authMiddleware");
const {
  authorizeRoles,
} = require("../../middleware/Authentication/roleMiddleware");

const router = express.Router();
router.use(authenticate, authorizeRoles("learner"));

router.post("/post", enrollmentController.enroll);
router.get("/get", enrollmentController.list);
router.get("/get/:id", enrollmentController.getById);
router.patch("/withdraw/:id", enrollmentController.withdraw);
router.patch("/resume/:id", enrollmentController.resume);

module.exports = router;
