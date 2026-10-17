// Seed khoa hoc mau de thu search / filter.
// Du lieu lay tu frontend/frontendSE/src/data/courses.js cho giong Homepage.
// Cac INSERT dung ON CONFLICT DO NOTHING de chay lai khong bi loi trung.

exports.up = (pgm) => {
  pgm.sql(`
    -- 1. Instructor (mat khau la placeholder nen khong dang nhap duoc, giong 002)
    INSERT INTO accounts (email, password_hash, full_name, role, status, created_at, updated_at)
    VALUES
      ('sarah.thompson@example.com', 'TEMP_PASSWORD_HASH', 'Sarah Thompson', 'instructor', 'active', NOW(), NOW()),
      ('aarya.singh@example.com',    'TEMP_PASSWORD_HASH', 'Aarya Singh',    'instructor', 'active', NOW(), NOW()),
      ('donna.stroupe@example.com',  'TEMP_PASSWORD_HASH', 'Donna Stroupe',  'instructor', 'active', NOW(), NOW()),
      ('olivia.wilson@example.com',  'TEMP_PASSWORD_HASH', 'Olivia Wilson',  'instructor', 'active', NOW(), NOW()),
      ('adora.montminy@example.com', 'TEMP_PASSWORD_HASH', 'Adora Montminy', 'instructor', 'active', NOW(), NOW()),
      ('samira.hadid@example.com',   'TEMP_PASSWORD_HASH', 'Samira Hadid',   'instructor', 'active', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;

    -- 2. Categories
    INSERT INTO categories (name, slug)
    VALUES
      ('IELTS Preparation', 'ielts-preparation'),
      ('Vocabulary',        'vocabulary'),
      ('Listening',         'listening'),
      ('Speaking',          'speaking'),
      ('Reading',           'reading')
    ON CONFLICT DO NOTHING;

    -- 3. Bon ky nang goc cua IELTS
    INSERT INTO skills (code, name, description)
    VALUES
      ('listening', 'Listening', 'IELTS Listening'),
      ('reading',   'Reading',   'IELTS Reading'),
      ('writing',   'Writing',   'IELTS Writing'),
      ('speaking',  'Speaking',  'IELTS Speaking')
    ON CONFLICT (code) DO NOTHING;

    -- 4. Courses
    INSERT INTO courses (
      instructor_id, category_id, title, slug, description, thumbnail_url,
      status, is_featured, created_at, updated_at, published_at
    )
    SELECT
      a.id, c.id, v.title, v.slug, v.description, v.thumbnail_url,
      'published', v.is_featured, NOW(), NOW(), NOW()
    FROM (VALUES
      ('sarah.thompson@example.com', 'ielts-preparation',
       'IELTS Academic Mastery: Band 7.5 Intensive Program', 'academic-mastery',
       'Build the skills and confidence to target Band 7.5 with focused IELTS Academic practice.',
       '/course-assets/academic-mastery.png', true),
      ('sarah.thompson@example.com', 'ielts-preparation',
       'IELTS General Training: Band 7 Fast Track', 'general-training',
       'Prepare for IELTS General Training with a focused path toward your Band 7 goal.',
       '/course-assets/general-training.png', false),
      ('aarya.singh@example.com', 'ielts-preparation',
       'Masterclass IELTS 8.0 by Aarya Singh (2026)', 'masterclass',
       'Explore advanced IELTS strategies and practice with a Band 8 masterclass.',
       '/course-assets/masterclass.png', false),
      ('donna.stroupe@example.com', 'vocabulary',
       'Lexical Resources: IELTS Vocabulary Topics', 'vocabulary',
       'Strengthen your IELTS vocabulary with lexical resources organized around useful topics.',
       '/course-assets/vocabulary.png', false),
      ('olivia.wilson@example.com', 'listening',
       'Daily Listening with me', 'listening',
       'Practice your listening skills with regular IELTS-focused exercises.',
       '/course-assets/listening.png', false),
      ('adora.montminy@example.com', 'speaking',
       'The efficient way of speaking English confidently', 'speaking',
       'Build confidence and fluency for English speaking and IELTS practice.',
       '/course-assets/speaking.png', false),
      ('samira.hadid@example.com', 'reading',
       'Reading Course: Books to Change Your Mindset', 'reading',
       'Develop your reading skills through engaging texts and IELTS reading practice.',
       '/course-assets/reading.png', false)
    ) AS v(instructor_email, category_slug, title, slug, description, thumbnail_url, is_featured)
    JOIN accounts a   ON a.email = v.instructor_email
    JOIN categories c ON c.slug  = v.category_slug
    ON CONFLICT (slug) DO NOTHING;

    -- 5. Do kho theo tung ky nang. Tong weight moi khoa hoc = 1.
    -- current_difficulty_rating chi la gia tri tam: 1000 + (band - 4) * 150
    INSERT INTO course_skills (
      course_id, skill_id, initial_band, current_difficulty_rating, weight, updated_at
    )
    SELECT co.id, s.id, v.band, v.rating, v.weight, NOW()
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
      ('speaking',  'speaking',  6.5, 1375, 1.00),
      ('reading',   'reading',   6.0, 1300, 1.00)
    ) AS v(course_slug, skill_code, band, rating, weight)
    JOIN courses co ON co.slug = v.course_slug
    JOIN skills s   ON s.code  = v.skill_code
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM course_skills
    WHERE course_id IN (
      SELECT id FROM courses
      WHERE slug IN (
        'academic-mastery', 'general-training', 'masterclass',
        'vocabulary', 'listening', 'speaking', 'reading'
      )
    );

    DELETE FROM courses
    WHERE slug IN (
      'academic-mastery', 'general-training', 'masterclass',
      'vocabulary', 'listening', 'speaking', 'reading'
    );

    DELETE FROM categories
    WHERE slug IN (
      'ielts-preparation', 'vocabulary', 'listening', 'speaking', 'reading'
    );

    DELETE FROM skills
    WHERE code IN ('listening', 'reading', 'writing', 'speaking');

    DELETE FROM accounts
    WHERE email IN (
      'sarah.thompson@example.com',
      'aarya.singh@example.com',
      'donna.stroupe@example.com',
      'olivia.wilson@example.com',
      'adora.montminy@example.com',
      'samira.hadid@example.com'
    );
  `);
};