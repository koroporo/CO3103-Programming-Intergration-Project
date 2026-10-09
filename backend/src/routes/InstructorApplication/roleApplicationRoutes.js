const express = require("express");
const router = express.Router();

const {
    submitInstructorApplication
} = require("../controllers/roleApplicationController");

const requireAuth = require("../middleware/requireAuth"); // <-- this one need to be fixed

router.post(
    "/",
    requireAuth,
    submitInstructorApplication
);

module.exports = router;
