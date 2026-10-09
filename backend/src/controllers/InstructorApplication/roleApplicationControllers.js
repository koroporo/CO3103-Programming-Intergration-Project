const roleApplicationServices = require(
    "../services/roleApplicationServices"
);

async function submitInstructorApplication(req, res) {
    try {
        // Supplied by your authentication middleware
        const applicantId = req.user.id;

        const { application_text } = req.body;

        const application =
            await roleApplicationServices
                .submitInstructorApplication(
                    applicantId,
                    application_text
                );

        return res.status(201).json({
            message: "Instructor application submitted",
            application
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
}

module.exports = {
    submitInstructorApplication
};
