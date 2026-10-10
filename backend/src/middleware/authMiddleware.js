const { verifyToken } = require("../services/tokenService");

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  // header phải có dạng: Authorization: Bearer <token>
  const parts = authorization.split(" ");

  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || !parts[1]) {
    return res.status(401).json({
      message: "Use Authorization: Bearer <token>"
    });
  }

  let payload;

  try {
    payload = verifyToken(parts[1]);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }

  if (!payload.id || typeof payload.role !== "string") {
    return res.status(401).json({
      message: "Invalid token data"
    });
  }

  req.user = {
    id: payload.id,
    role: payload.role
  };

  next();
}

module.exports = {
  authenticate
};
