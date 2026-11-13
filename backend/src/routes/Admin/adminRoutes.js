const router = require("express").Router();
const { authenticate } = require("../../middleware/Authentication/authMiddleware");
const { authorizeRoles } = require("../../middleware/Authentication/roleMiddleware");
const service = require("../../services/Admin/adminDeletionService");

// Audit entries are written by the server, never supplied by the caller.
for (const [resource, entity] of [["accounts", "account"], ["courses", "course"]]) {
  router.delete(`/${resource}/:id`, authenticate, authorizeRoles("admin"), async (req, res, next) => {
    try {
      const result = await service.remove(entity, req.params.id, req.body, req.user);
      res.status(200).json({ [entity]: result });
    } catch (error) {
      next(error);
    }
  });
}

module.exports = router;
