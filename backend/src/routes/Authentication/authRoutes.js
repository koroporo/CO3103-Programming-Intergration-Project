const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const { authorizeRoles } = require("../../middleware/Authentication/roleMiddleware");

const authController = require("../../controllers/Authentication/authControllers");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

router.post("/adminRegister", authenticate, authorizeRoles("admin"), authController.adminRegister);
router.post("/instructorRegister", authController.instructorRegister);
// dislplay user data
router.get("/me", authenticate, authController.getMe);

module.exports = router;