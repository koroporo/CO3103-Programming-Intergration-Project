const courseService = require("../services/courseService");

async function searchCourses(req, res) {
    const searchTerm = req.query.search ?? "";

    try {
        const result = await courseService.searchCourses(
            searchTerm,
            req.query.page,
            req.query.limit
        );
        return res.json(result);
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ error: error.message });
        }

        console.error("Failed to search courses:", error);
        return res.status(500).json({ error: "Failed to search courses" });
    }
}

module.exports = {
    searchCourses
};
