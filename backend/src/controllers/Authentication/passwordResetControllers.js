// controllers/authentication/passwordResetController.js

const {
  requestPasswordResetService,
  resetPasswordService,
} = require("../../services/authentication/passwordResetService");

async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    const result = await requestPasswordResetService(email);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Forgot password controller failed:", error);

    return res.status(error.statusCode || 500).json({
      error:
        error.statusCode === 400
          ? error.message
          : "Failed to request password reset",
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const result = await resetPasswordService(token, password);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Reset password controller failed:", error);

    return res.status(error.statusCode || 500).json({
      error:
        error.statusCode === 400
          ? error.message
          : "Failed to reset password",
    });
  }
}

module.exports = {
  requestPasswordReset,
  resetPassword,
};