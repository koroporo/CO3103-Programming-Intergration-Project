const pool = require("../../db");

async function createRoleApplication({
    applicantId,
    applicationText,
    evidenceUrl
}) {
    const result = await pool.query(`
    INSERT INTO role_applications (
        applicant_id,
        requested_role,
        application_text,
        evidence_url,
        status,
        submitted_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, applicant_id, requested_role,
              application_text, evidence_url, status, submitted_at`,
    [applicantId, "instructor", applicationText, evidenceUrl, "pending"]
    );
    return result.rows[0];
    }

async function listApplicationsByStatus(status) {
    const result = await pool.query(
        `SELECT ra.id, ra.applicant_id, ra.requested_role, ra.application_text,
                ra.evidence_url, ra.status, ra.review_note,
                ra.submitted_at, ra.reviewed_at,
                a.full_name, a.email
         FROM role_applications ra
         JOIN accounts a ON a.id = ra.applicant_id
         WHERE ra.status = $1
         ORDER BY ra.submitted_at ASC`,
        [status]
    );
    return result.rows;
}

// Tra ve null neu khong co don pending voi id nay
async function reviewApplication({ applicationId, adminId, decision, reviewNote }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const found = await client.query(
            `SELECT id, applicant_id, requested_role
             FROM role_applications
             WHERE id = $1 AND status = 'pending'
             FOR UPDATE`,
            [applicationId]
        );

        if (found.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        const application = found.rows[0];
        let newStatus = "rejected";
        if (decision === "accept") {
            newStatus = "approved";
        }

        await client.query(
            `UPDATE role_applications
             SET status = $1, review_note = $2, reviewed_by = $3, reviewed_at = NOW()
             WHERE id = $4`,
            [newStatus, reviewNote, adminId, applicationId]
        );

        if (decision === "accept") {
            await client.query(
                `UPDATE accounts
                 SET role = $1::account_role, updated_at = NOW()
                 WHERE id = $2`,
                [application.requested_role, application.applicant_id]
            );
        }

        await client.query("COMMIT");
        return { id: application.id, status: newStatus };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    createRoleApplication,
    listApplicationsByStatus,
    reviewApplication
};