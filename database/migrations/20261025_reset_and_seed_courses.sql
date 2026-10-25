-- Development database only!
-- This removes existing courses and dependent course content.
BEGIN;

TRUNCATE TABLE courses RESTART IDENTITY CASCADE;

-- 1. Ensure instructor accounts exist.
INSERT INTO accounts
    (email, full_name, password_hash, role, status, created_at, updated_at)
VALUES
    ('sarah.thompson@example.com', 'Sarah Thompson', 'TEMP_PASSWORD_HASH', 'instructor', 'active', NOW(), NOW()),
    ('aarya.singh@example.com', 'Aarya Singh', 'TEMP_PASSWORD_HASH', 'instructor', 'active', NOW(), NOW()),
    ('donna.stroupe@example.com', 'Donna Stroupe', 'TEMP_PASSWORD_HASH', 'instructor', 'active', NOW(), NOW()),
    ('olivia.wilson@example.com', 'Olivia Wilson', 'TEMP_PASSWORD_HASH', 'instructor', 'active', NOW(), NOW()),
    ('adora.montminy@example.com', 'Adora Montminy', 'TEMP_PASSWORD_HASH', 'instructor', 'active', NOW(), NOW()),
    ('samira.hadid@example.com', 'Samira Hadid', 'TEMP_PASSWORD_HASH', 'instructor', 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = 'instructor',
    status = 'active',
    updated_at = NOW();

-- 2. Ensure course categories exist.
INSERT INTO categories (name, slug)
VALUES
    ('IELTS Preparation', 'ielts-preparation'),
    ('Vocabulary', 'vocabulary'),
    ('Listening', 'listening'),
    ('Speaking', 'speaking'),
    ('Reading', 'reading')
ON CONFLICT DO NOTHING;

-- 3. Ensure skills exist.
INSERT INTO skills (code, name, description)
VALUES
    ('listening', 'Listening', 'English listening skill'),
    ('reading', 'Reading', 'English reading skill'),
    ('writing', 'Writing', 'English writing skill'),
    ('speaking', 'Speaking', 'English speaking skill')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 4. Seed seven courses.
INSERT INTO courses
    (title, slug, instructor_id, category_id, description,
     thumbnail_url, status, is_featured,
     created_at, updated_at, published_at)
SELECT
    v.title,
    v.slug,
    a.id,
    cat.id,
    v.description,
    v.thumbnail_url,
    'published',
    v.is_featured,
    NOW(),
    NOW(),
    NOW()
FROM (VALUES
    ('IELTS Academic Mastery: Band 7.5 Intensive Program',
     'academic-mastery', 'sarah.thompson@example.com',
     'ielts-preparation',
     'An intensive IELTS Academic preparation course targeting Band 7.5 across all four skills.',
     '/course-assets/academic-mastery.png', TRUE),

    ('IELTS General Training: Band 7 Fast Track',
     'general-training', 'sarah.thompson@example.com',
     'ielts-preparation',
     'A focused IELTS General Training course designed to prepare learners for Band 7.',
     '/course-assets/general-training.png', FALSE),

    ('Masterclass IELTS 8.0 by Aarya Singh (2026)',
     'masterclass', 'aarya.singh@example.com',
     'ielts-preparation',
     'An advanced IELTS masterclass covering listening, reading, writing, and speaking.',
     '/course-assets/masterclass.png', FALSE),

    ('Lexical Resources: IELTS Vocabulary Topics',
     'vocabulary', 'donna.stroupe@example.com',
     'vocabulary',
     'Build IELTS vocabulary and lexical resources for reading and writing tasks.',
     '/course-assets/vocabulary.png', FALSE),

    ('Daily Listening with me',
     'listening', 'olivia.wilson@example.com',
     'listening',
     'Practice English listening comprehension through regular listening activities.',
     '/course-assets/listening.png', FALSE),

    ('The efficient way of speaking English confidently',
     'speaking', 'adora.montminy@example.com',
     'speaking',
     'Develop English speaking skills and build confidence in everyday communication.',
     '/course-assets/speaking.png', FALSE),

    ('Reading Course: Books to Change Your Mindset',
     'reading', 'samira.hadid@example.com',
     'reading',
     'Improve English reading comprehension through engaging books and reading practice.',
     '/course-assets/reading.png', FALSE)
) AS v(
    title, slug, instructor_email, category_slug,
    description, thumbnail_url, is_featured
)
JOIN accounts a ON a.email = v.instructor_email
JOIN categories cat ON cat.slug = v.category_slug;
-- 5. Seed course-skill relationships.
-- 5. Seed course-skill relationships.
INSERT INTO course_skills
    (course_id, skill_id, initial_band, current_difficulty_rating, weight, updated_at)
SELECT
    c.id,
    s.id,
    v.initial_band,
    v.current_difficulty_rating,
    v.weight,
    NOW()
FROM (VALUES
    ('academic-mastery', 'listening', 7.5, 1525, 0.25),
    ('academic-mastery', 'reading',   7.5, 1525, 0.25),
    ('academic-mastery', 'writing',   7.5, 1525, 0.25),
    ('academic-mastery', 'speaking',  7.5, 1525, 0.25),

    ('general-training', 'listening', 7.0, 1450, 0.25),
    ('general-training', 'reading',   7.0, 1450, 0.25),
    ('general-training', 'writing',   7.0, 1450, 0.25),
    ('general-training', 'speaking',  7.0, 1450, 0.25),

    ('masterclass', 'listening', 8.0, 1600, 0.25),
    ('masterclass', 'reading',   8.0, 1600, 0.25),
    ('masterclass', 'writing',   8.0, 1600, 0.25),
    ('masterclass', 'speaking',  8.0, 1600, 0.25),

    ('vocabulary', 'reading', 6.0, 1300, 0.50),
    ('vocabulary', 'writing', 6.0, 1300, 0.50),

    ('listening', 'listening', 5.5, 1225, 1.00),
    ('speaking', 'speaking',   6.5, 1375, 1.00),
    ('reading', 'reading',     6.0, 1300, 1.00)
) AS v(course_slug, skill_code, initial_band, current_difficulty_rating, weight)
JOIN courses c ON c.slug = v.course_slug
JOIN skills s ON s.code = v.skill_code;

COMMIT;
