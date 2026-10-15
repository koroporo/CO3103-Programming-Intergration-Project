const express = require("express");
const courseController = require("../../controllers/Course/courseControllers");
const router = express.Router();

router.get("/", courseController.searchCourses);

module.exports = router;
