const express = require("express");
const router = express.Router();

const {
  requestPasswordReset,
  resetPassword,
} = require("../../controllers/Authentication/passwordResetControllers");

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;