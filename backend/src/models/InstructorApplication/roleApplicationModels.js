const pool = require("../db");

async function createRoleApplication({
    applicantId,
    applicationText
}) {
    const query = `
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
              application_text, evidence_url, status, submitted_at;
`;

const values = [
    applicantId,
    "instructor",
    applicationText,
    evidenceUrl || null,
    "pending"
];

const result = await pool.query(query, values);
return result.rows[0];
}

module.exports = {
    createRoleApplication
};

