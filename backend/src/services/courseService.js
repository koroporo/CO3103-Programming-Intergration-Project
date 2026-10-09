const courseModel = require("../models/courseModel");

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

async function searchCourses(searchTerm, pageValue, limitValue) {
    if (typeof searchTerm !== "string") {
        const error = new Error("The search query must be a single string");
        error.statusCode = 400;
        throw error;
    }

    const normalizedSearchTerm = searchTerm.trim();

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

    const result = await courseModel.searchPublishedCourses(
        normalizedSearchTerm,
        page,
        limit
    );

    return {
        ...result,
        page,
        limit
    };
}

module.exports = {
    searchCourses
};
