const authService = require("../../services/Authentication/authService");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await authService.login(
      email.trim(),
      password
    );

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // 3. Store JWT in an HttpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false, // Local HTTP development only
      sameSite: "lax",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}
async function register(req, res) {
  try {
    const { email, password, full_name: fullName } = req.body;

    const account = await authService.register({
      email,
      password,
      fullName,
    });

    return res.status(201).json({ account });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    console.error("Account registration failed", error);

    return res.status(500).json({
      error: "Failed to register account",
    });
  }
}
module.exports = {
  login,
  register
};