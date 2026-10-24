const authService = require("../../services/Authentication/authService");
const { verifyToken } = require("../../services/Authentication/tokenService");

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

async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Match your local HTTP login settings
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
}

async function getMe(req, res) {
  try {
    // 1. Read JWT from the HttpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // 2. Verify JWT signature and expiration
    const payload = verifyToken(token);

    // 3. Get the account ID from the verified JWT
    const accountId = payload.id;

    // 4. Fetch account + user_data from PostgreSQL
    const user = await authService.getCurrentUser(accountId);

    return res.status(200).json(user);

  } catch (error) {
    // Invalid or expired JWT
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.statusCode === 401
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication"
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        message: error.message
      });
    }

    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

module.exports = {
  login,
  register,
  logout,
  getMe
};