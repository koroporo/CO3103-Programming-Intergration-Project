const roleApplicationModels = require(
    "../models/roleApplicationModels"
);

async function submitInstructorApplication(
    applicantId,
    applicationText
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
            applicationText: applicationText.trim()
        });

    return application;
}

module.exports = {
    submitInstructorApplication
};

