const express = require("express");
const router = express.Router();

const pool = require("../../db");
const {
  authenticate,
} = require("../../middleware/Authentication/authMiddleware");

// PUT /api/preferences
router.put("/", authenticate, async (req, res) => {
  try {
    const { goal, level } = req.body;

    if (!goal || !level) {
      return res.status(400).json({
        message: "Goal and level are required",
      });
    }

    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE accounts
       SET target_skill = $1,
           target_overall_band = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, target_skill, target_overall_band`,
      [goal, level, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({
      message: "Learning preferences saved successfully",
      preferences: result.rows[0],
    });
  } catch (error) {
    console.error("Saving preferences failed:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
