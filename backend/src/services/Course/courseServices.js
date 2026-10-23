const courseModel = require("../../models/Course/courseModels");

const SKILLS = ["listening", "reading", "writing", "speaking"];

function parsePositiveInteger(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }

    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        const error = new Error("Page and limit must be positive integers");
        error.statusCode = 400;
        throw error;
    }

    const parsedValue = Number(value);

    if (!Number.isSafeInteger(parsedValue)) {
        const error = new Error("Page and limit must be safe integers");
        error.statusCode = 400;
        throw error;
    }

    return parsedValue;
}

function parseSkill(value) {
    if (value === undefined || value === "") {
        return null;
    }
 
    if (typeof value !== "string" || !SKILLS.includes(value.toLowerCase())) {
        const error = new Error(`Skill must be one of: ${SKILLS.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }
 
    return value.toLowerCase();
}
 
function parseBand(value) {
    if (value === undefined || value === "") {
        return null;
    }

    if (typeof value !== "string" || !/^\d(\.\d)?$/.test(value)) {
        const error = new Error("Band must be a number such as 6 or 6.5");
        error.statusCode = 400;
        throw error;
    }

    const band = Number(value);

    if (band < 3 || band > 9 || (band * 2) % 1 !== 0) {
        const error = new Error("Band must be between 3.0 and 9.0 in steps of 0.5");
        error.statusCode = 400;
        throw error;
    }

    return band;
}

async function searchCourses({ search, skill, band, page: pageValue, limit: limitValue }) {
    if (typeof search !== "string") {
        const error = new Error("The search query must be a single string");
        error.statusCode = 400;
        throw error;
    }

    const normalizedSearchTerm = search.trim();

    if (normalizedSearchTerm.length > 100) {
        const error = new Error("Search term must be 100 characters or fewer");
        error.statusCode = 400;
        throw error;
    }

    const page = parsePositiveInteger(pageValue, 1);
    const limit = parsePositiveInteger(limitValue, 20);

    if (limit > 50) {
        const error = new Error("Limit must not exceed 50");
        error.statusCode = 400;
        throw error;
    }

    if ((page - 1) * limit > Number.MAX_SAFE_INTEGER) {
        const error = new Error("The requested page is too large");
        error.statusCode = 400;
        throw error;
    }
    const parsedSkill = parseSkill(skill);
    const parsedBand = parseBand(band);
    if (parsedBand != null && !parsedSkill) {
        const error = new Error("Band requires a skill");
        error.statusCode = 400;
        throw error;
    }
    const result = await courseModel.searchPublishedCourses({
        searchTerm: normalizedSearchTerm,
        skill: parsedSkill,
        minBand: parsedBand,
        maxBand: parsedBand,
        page,
        limit
    });

    return {
        ...result,
        page,
        limit
    };
}

module.exports = {
    searchCourses
};
