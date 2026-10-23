const express = require("express");
const router = express.Router();

const {
    submitInstructorApplication
} = require("../../controllers/InstructorApplication/roleApplicationControllers");

const {
    authenticate
} = require("../../middleware/authentication/authMiddleware");

router.post(
    "/",
    authenticate,
    submitInstructorApplication
);

module.exports = router;
