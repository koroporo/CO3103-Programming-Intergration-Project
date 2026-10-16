const courseService = require("../../services/Course/courseServices");

async function searchCourses(req, res) {
    try {
        const result = await courseService.searchCourses({
            search: req.query.search ?? "",
            skill: req.query.skill,
            level: req.query.level,
            page: req.query.page,
            limit: req.query.limit
        });
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
