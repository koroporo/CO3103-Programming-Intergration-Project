
BEGIN;

WITH new_bank AS (
    INSERT INTO question_banks (
        owner_id,
        course_id,
        name,
        description,
        status,
        created_at
    )
    VALUES (
        17,
        2,
        'IELTS Writing Assignments',
        'Writing assignments for Masterclass IELTS 8.0',
        'active',
        NOW()
    )
    RETURNING id
),
new_question AS (
    INSERT INTO questions (
        question_bank_id,
        creator_id,
        skill_id,
        source_lesson_id,
        question_type,
        prompt,
        answer_key,
        explanation,
        difficulty_rating,
        status,
        created_at
    )
    SELECT
        id,
        17,
        3,
        6,
        'essay',
        'Some people believe that online learning is more effective than traditional classroom learning. To what extent do you agree or disagree? Give reasons and examples to support your answer.',
        NULL,
        'Write a structured essay with a clear position and supporting examples.',
        3.0,
        'active',
        NOW()
    FROM new_bank
    RETURNING id
),
new_assessment AS (
    INSERT INTO assessments (
        creator_id,
        course_id,
        lesson_id,
        title,
        purpose,
        response_mode,
        status,
        is_required,
        question_count,
        max_attempts,
        passing_percent,
        grading_rubric,
        created_at
    )
    VALUES (
        17,
        2,
        6,
        'Lesson 6: IELTS Writing Practice',
        'assignment',
        'quiz',
        'published',
        TRUE,
        1,
        3,
        0,
        '{
            "criteria": [
                "Task response",
                "Coherence and cohesion",
                "Lexical resource",
                "Grammatical range and accuracy"
            ],
            "grading_method": "manual"
        }'::jsonb,
        NOW()
    )
    RETURNING id
)
INSERT INTO assessment_questions (
    assessment_id,
    question_id,
    max_points,
    is_required
)
SELECT
    a.id,
    q.id,
    100,
    TRUE
FROM new_assessment a
CROSS JOIN new_question q;

COMMIT;
