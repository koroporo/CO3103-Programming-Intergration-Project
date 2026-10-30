const express = require("express");
const router = express.Router();

const authController = require("../../controllers/Authentication/authControllers");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

router.post("/adminRegister", authController.adminRegister);
router.post("/instructorRegister", authController.instructorRegister);
// dislplay user data
router.get("/me", authController.getMe);

module.exports = router;