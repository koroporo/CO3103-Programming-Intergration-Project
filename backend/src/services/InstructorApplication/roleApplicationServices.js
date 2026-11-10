const roleApplicationModels = require(
    "../../models/InstructorApplication/roleApplicationModels"
);
const STATUSES = ["pending", "approved", "rejected"];
async function submitInstructorApplication(
    applicantId,
    applicationText,
    evidenceUrl
) {
    if (
        typeof applicationText !== "string" ||
        applicationText.trim().length === 0
    ) {
        const error = new Error(
            "Application description is required"
        );
        error.statusCode = 400;
        throw error;
    }

    const application =
        await roleApplicationModels.createRoleApplication({
            applicantId,
            applicationText: applicationText.trim(),
            evidenceUrl
        });

    return application;
}
async function listApplications(status) {
    let parsedStatus = "pending";

    if (status !== undefined && status !== "") {
        parsedStatus = status;
    }

    if (typeof parsedStatus !== "string" || !STATUSES.includes(parsedStatus)) {
        const error = new Error(`Status must be one of: ${STATUSES.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

    return roleApplicationModels.listApplicationsByStatus(parsedStatus);
}

async function reviewApplication({ applicationId, adminId, decision, reviewNote }) {
    if (typeof applicationId !== "string" || !/^[1-9]\d*$/.test(applicationId)) {
        const error = new Error("Application id must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    if (decision !== "accept" && decision !== "reject") {
        const error = new Error("Decision must be accept or reject");
        error.statusCode = 400;
        throw error;
    }

    let note = null;
    if (typeof reviewNote === "string" && reviewNote.trim().length > 0) {
        note = reviewNote.trim();
    }

    if (note !== null && note.length > 1000) {
        const error = new Error("Review note must be 1000 characters or fewer");
        error.statusCode = 400;
        throw error;
    }

    if (decision === "reject" && note === null) {
        const error = new Error("A reason is required to reject an application");
        error.statusCode = 400;
        throw error;
    }

    const result = await roleApplicationModels.reviewApplication({
        applicationId,
        adminId,
        decision,
        reviewNote: note
    });

    if (result === null) {
        const error = new Error("Pending application not found");
        error.statusCode = 404;
        throw error;
    }

    return result;
}

module.exports = {
    submitInstructorApplication,
    listApplications,
    reviewApplication
};

