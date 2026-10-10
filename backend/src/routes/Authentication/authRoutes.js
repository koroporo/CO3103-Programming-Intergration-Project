const express = require("express");
const router = express.Router();

const authController = require("../../controllers/Authentication/authControllers");

router.post("/login", authController.login);

module.exports = router;