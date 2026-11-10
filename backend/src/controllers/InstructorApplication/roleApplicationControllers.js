const roleApplicationServices = require(
    "../../services/InstructorApplication/roleApplicationServices"
);

function sendError(res, error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
        message: error.statusCode
            ? error.message
            : "Internal server error"
    });
}
async function submitInstructorApplication(req, res) {
    try {
        // Supplied by your authentication middleware
        const applicantId = req.user.id;

        const { application_text } = req.body;
        const evidenceUrl = null;

        const application =
            await roleApplicationServices
                .submitInstructorApplication(
                    applicantId,
                    application_text,
                    evidenceUrl
                );

        return res.status(201).json({
            message: "Instructor application submitted",
            application
        });
    } catch (error) {
        return sendError(res, error);
    }
}

async function listApplications(req, res) {
    try {
        const applications =
            await roleApplicationServices.listApplications(req.query.status);

        return res.json({ applications });
    } catch (error) {
        return sendError(res, error);
    }
}

async function reviewApplication(req, res) {
    try {
        const application = await roleApplicationServices.reviewApplication({
            applicationId: req.params.id,
            adminId: req.user.id,
            decision: req.body?.decision,
            reviewNote: req.body?.review_note
        });

        return res.json({
            message: "Application reviewed",
            application
        });
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = {
    submitInstructorApplication,
    listApplications,
    reviewApplication
};
