const express = require("express");
const router = express.Router();

const authController = require("../../controllers/Authentication/authControllers");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

// dislplay user data
router.get("/me", authController.getMe);

module.exports = router;