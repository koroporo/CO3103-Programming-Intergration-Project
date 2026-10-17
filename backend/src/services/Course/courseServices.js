const courseModel = require("../../models/Course/courseModels");

const SKILLS = ["listening", "reading", "writing", "speaking"];
const LEVEL_BANDS = {
    a1: { minBand: 0, maxBand: 2.5 },
    a2: { minBand: 3, maxBand: 3.5 },
    b1: { minBand: 4, maxBand: 5 },
    b2: { minBand: 5.5, maxBand: 6.5 },
    c1: { minBand: 7, maxBand: 8 },
    c2: { minBand: 8.5, maxBand: 9 }
};

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
 
function parseLevel(value) {
    if (value === undefined || value === "") {
        return null;
    }
 
    if (typeof value !== "string" || !(value.toLowerCase() in LEVEL_BANDS)) {
        const error = new Error(`Level must be one of: ${Object.keys(LEVEL_BANDS).join(", ")}`);
        error.statusCode = 400;
        throw error;
    }
 
    return value.toLowerCase();
}

async function searchCourses({ search, skill, level, page: pageValue, limit: limitValue }) {
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
    const parsedLevel = parseLevel(level);
    if (parsedLevel && !parsedSkill) {
        const error = new Error("Level requires a skill");
        error.statusCode = 400;
        throw error;
    }
    let bands;
    if (parsedLevel) {
        bands = LEVEL_BANDS[parsedLevel];
    } else {
        bands = { minBand: null, maxBand: null };
    }
    const result = await courseModel.searchPublishedCourses({
        searchTerm: normalizedSearchTerm,
        skill: parsedSkill,
        minBand: bands.minBand,
        maxBand: bands.maxBand,
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
