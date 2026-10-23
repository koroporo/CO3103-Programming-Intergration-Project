const roleApplicationModels = require(
    "../../models/InstructorApplication/roleApplicationModels"
);

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

module.exports = {
    submitInstructorApplication
};

