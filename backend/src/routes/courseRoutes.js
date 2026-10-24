const express = require("express");
const courseController = require("../controllers/courseController");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/user/:user_id", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getCoursesByUserId);
router.get("/get/:id", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getCourse);
router.get("/chapter/get/:id", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getChapter);
router.get("/chapter/:id/lessons", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getLessons);
router.get("/lesson/get/:id", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getLesson);
router.get("/lesson/:id/materials", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getMaterials);
router.get("/material/get/:id", authorizeRoles("user", "learner", "instructor", "admin"), courseController.getMaterial);

module.exports = router;
