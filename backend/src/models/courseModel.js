const pool = require("../db");

async function searchPublishedCourses(searchTerm, page, limit) {
    const pattern = `%${searchTerm}%`;
    const offset = (page - 1) * limit;
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
                accounts.full_name AS instructor_name
            FROM courses
            JOIN categories ON categories.id = courses.category_id
            JOIN accounts ON accounts.id = courses.instructor_id
            WHERE courses.status = 'published'
              AND (
                $1::text = ''
                OR courses.title ILIKE $2
                OR courses.description ILIKE $2
                OR categories.name ILIKE $2
              )
            ORDER BY courses.is_featured DESC, courses.published_at DESC NULLS LAST, courses.id
            LIMIT $3
            OFFSET $4
            `,
            [searchTerm, pattern, limit, offset]
        ),
        pool.query(
            `
            SELECT COUNT(*) AS total
            FROM courses
            JOIN categories ON categories.id = courses.category_id
            WHERE courses.status = 'published'
              AND (
                $1::text = ''
                OR courses.title ILIKE $2
                OR courses.description ILIKE $2
                OR categories.name ILIKE $2
              )
            `,
            [searchTerm, pattern]
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
