const accountModel = require("../../models/Authentication/accountModels");
const { verifyToken } = require("../../services/Authentication/tokenService");

async function authenticate(req, res, next) {
  // 1. Get the JWT from the HttpOnly cookie
  // Prefer the HttpOnly cookie; allow Bearer tokens for API testing.
  const authHeader = req.headers.authorization;

  const token =
    req.cookies?.token ||
    (authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null);

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

  // A valid JWT must not revive a deleted account or retain an old role.
  let account;
  try {
    const id = String(payload.id);
    if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
      return res.status(401).json({ message: "Invalid token data" });
    }
    account = await accountModel.findById(id);
  } catch (error) {
    return next(error);
  }
  if (!account || account.status !== "active") {
    return res.status(401).json({ message: "An active account is required" });
  }

  req.user = {
    id: account.id,
    role: account.role
  };

  // 5. Continue to the next middleware or controller
  next();
}

module.exports = {
  authenticate
};
