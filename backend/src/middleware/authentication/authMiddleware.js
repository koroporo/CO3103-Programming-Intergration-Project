const { verifyToken } = require("../services/tokenService");

function authenticate(req, res, next) {
  // 1. Get the JWT from the HttpOnly cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  // 2. Verify the JWT
  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }

  // 3. Validate the token payload
  if (!payload.id || typeof payload.role !== "string") {
    return res.status(401).json({
      message: "Invalid token data"
    });
  }

  // 4. Attach authenticated user information to the request
  req.user = {
    id: payload.id,
    role: payload.role
  };

  // 5. Continue to the next middleware or controller
  next();
}

module.exports = {
  authenticate
};
