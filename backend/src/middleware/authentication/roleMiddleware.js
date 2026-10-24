const accountModel = require("../../models/Authentication/accountMode(unused)");

function authorizeRoles(...allowedRoles) {
  return async function checkRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const account = await accountModel.findById(req.user.id);
    if (!account || account.status !== "active") {
      return res.status(403).json({ message: "Account is not active" });
    }
    const hasAllowedRole = allowedRoles.includes(account.role);
    if (!hasAllowedRole) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    req.user = { id: account.id, role: account.role };

    next();
  };
}

module.exports = { authorizeRoles };
