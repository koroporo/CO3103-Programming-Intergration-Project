const pool = require("../../db");

function escapeLike(text) {
    return text.replace(/[\\%_]/g, "\\$&");
}
const FROM_AND_FILTERS = `
    FROM courses
    JOIN categories ON categories.id = courses.category_id
    JOIN accounts ON accounts.id = courses.instructor_id
    LEFT JOIN course_skills AS selected_skill
        ON selected_skill.course_id = courses.id
       AND selected_skill.skill_id = (SELECT id FROM skills WHERE code = $3::text)
    WHERE courses.status = 'published'
      AND (
        $1::text = ''
        OR courses.title ILIKE $2
        OR courses.description ILIKE $2
        OR categories.name ILIKE $2
      )
      AND ($3::text IS NULL OR selected_skill.skill_id IS NOT NULL)
      AND ($4::numeric IS NULL OR selected_skill.initial_band >= $4)
      AND ($5::numeric IS NULL OR selected_skill.initial_band <= $5)
`;
async function searchPublishedCourses({searchTerm, skill, minBand, maxBand, page, limit}) {
    const pattern = `%${escapeLike(searchTerm)}%`;
    const offset = (page - 1) * limit;
    const filterParams = [searchTerm, pattern, skill, minBand, maxBand];
    const [coursesResult, countResult] = await Promise.all([
        pool.query(
            `
            SELECT
                courses.id,
                courses.title,
                courses.slug,
                courses.description,
                courses.thumbnail_url,
                categories.name AS category_name,
                accounts.full_name AS instructor_name,
                selected_skill.initial_band::float8 AS band
            ${FROM_AND_FILTERS}
            ORDER BY courses.is_featured DESC, courses.published_at DESC NULLS LAST, courses.id
            LIMIT $6
            OFFSET $7
            `,
            [...filterParams, limit, offset]
        ),
        pool.query(
            `SELECT COUNT(*) AS total ${FROM_AND_FILTERS}`,
            filterParams
        )
    ]);

    return {
        courses: coursesResult.rows,
        total: Number(countResult.rows[0].total)
    };
}

module.exports = {
    searchPublishedCourses
};
