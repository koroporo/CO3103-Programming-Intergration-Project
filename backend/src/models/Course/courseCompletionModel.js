
const pool = require("../../db");

async function getRecommendations(userId, courseId) {
  const query = `
    WITH user_context AS (
      SELECT
        a.id AS user_id,
        target_skill.id AS target_skill_id,
        recent_course.course_id AS recent_course_id,
        recent_course.initial_band AS recent_band
      FROM accounts a
      JOIN skills target_skill
        ON LOWER(target_skill.code) = LOWER(a.target_skill)
      JOIN LATERAL (
        SELECT cs.course_id, cs.initial_band, cs.skill_id
        FROM course_skills cs
        WHERE cs.course_id = $2
        ORDER BY
          CASE
            WHEN cs.skill_id = target_skill.id THEN 0
            ELSE 1
          END,
          cs.skill_id
        LIMIT 1
      ) recent_course ON TRUE
      WHERE a.id = $1
    ),

    candidates AS (
      -- HARD: Same skill, one band higher
      SELECT
        'HARD' AS recommendation_type,
        c.id AS course_id,
        c.title AS course_title,
        recommended_skill.id AS skill_id,
        recommended_skill.code AS skill_code,
        cs.initial_band
      FROM user_context uc
      JOIN course_skills cs
        ON cs.skill_id = uc.target_skill_id
       AND cs.initial_band = uc.recent_band + 1.0
      JOIN skills recommended_skill
        ON recommended_skill.id = cs.skill_id
      JOIN courses c
        ON c.id = cs.course_id
      WHERE c.id <> uc.recent_course_id

      UNION ALL

      -- MEDIUM: Same skill, same band
      SELECT
        'MEDIUM',
        c.id,
        c.title,
        recommended_skill.id,
        recommended_skill.code,
        cs.initial_band
      FROM user_context uc
      JOIN course_skills cs
        ON cs.skill_id = uc.target_skill_id
       AND cs.initial_band = uc.recent_band
      JOIN skills recommended_skill
        ON recommended_skill.id = cs.skill_id
      JOIN courses c
        ON c.id = cs.course_id
      WHERE c.id <> uc.recent_course_id

      UNION ALL

      -- EASY: Different skill, same band
      SELECT
        'EASY',
        c.id,
        c.title,
        recommended_skill.id,
        recommended_skill.code,
        cs.initial_band
      FROM user_context uc
      JOIN course_skills cs
        ON cs.skill_id <> uc.target_skill_id
       AND cs.initial_band = uc.recent_band
      JOIN skills recommended_skill
        ON recommended_skill.id = cs.skill_id
      JOIN courses c
        ON c.id = cs.course_id
      WHERE c.id <> uc.recent_course_id
    ),

    unique_candidates AS (
      SELECT DISTINCT ON (recommendation_type, course_id)
        *
      FROM candidates
      ORDER BY recommendation_type, course_id, skill_id
    )

    SELECT *
    FROM unique_candidates
    ORDER BY
      CASE recommendation_type
        WHEN 'HARD' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'EASY' THEN 3
      END,
      course_id;
  `;

  const result = await pool.query(query, [userId, courseId]);

  return result.rows;
}

module.exports = {
  getRecommendations,
};
