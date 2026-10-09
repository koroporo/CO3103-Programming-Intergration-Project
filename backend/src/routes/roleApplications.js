const express = require("express");
const pool = require("../db");

const router = express.Router();

const STATUS_APPROVED = "approved";
const STATUS_REJECTED = "rejected";
function requireAdmin(req, res, next) {
    next();
}

// GET /role-applications?status=pending
router.get("/", requireAdmin, async function (req, res) {
    let status = req.query.status;
    if (!status) {
        status = "pending";
    }

    try {
        const sql = `
            SELECT ra.id,
                   ra.applicant_id,
                   ra.requested_role,
                   ra.application_text,
                   ra.evidence_url,
                   ra.status,
                   ra.submitted_at,
                   a.full_name,
                   a.email
            FROM role_applications ra
            JOIN accounts a ON a.id = ra.applicant_id
            WHERE ra.status = $1
            ORDER BY ra.submitted_at ASC
        `;
        const result = await pool.query(sql, [status]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// PATCH /role-applications/:id
router.patch("/:id", requireAdmin, async function (req, res) {
    const id = req.params.id;
    const decision = req.body.decision;

    let reviewNote = req.body.review_note;
    if (!reviewNote) {
        reviewNote = null;
    }

    if (decision !== "accept" && decision !== "reject") {
        return res.status(400).json({ message: "decision must be accept or reject" });
    }

    let newStatus = STATUS_REJECTED;
    if (decision === "accept") {
        newStatus = STATUS_APPROVED;
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const found = await client.query(
            `SELECT id, applicant_id, requested_role
             FROM role_applications
             WHERE id = $1 AND status = 'pending'
             FOR UPDATE`,
            [id]
        );

        if (found.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Pending application not found" });
        }

        const application = found.rows[0];

        await client.query(
    `UPDATE role_applications
     SET status = $1, review_note = $2, reviewed_at = NOW()
     WHERE id = $3`,
    [newStatus, reviewNote, id]
);


        if (decision === "accept") {
            await client.query(
                `UPDATE accounts
                 SET role = $1::account_role,
                     updated_at = NOW()
                 WHERE id = $2`,
                [application.requested_role, application.applicant_id]
            );
        }
        await client.query("COMMIT");
        res.json({ message: "ok", status: newStatus });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});
module.exports = router;