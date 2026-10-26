-- Development seed: add chapters and lessons to the seven existing courses.
-- Safe to rerun: chapter/lesson positions are upserted, and videos/materials are upserted.
-- This script does NOT delete courses or existing learner progress.
BEGIN;

-- 1. Two chapters for each existing course:
--    Chapter 1 = Introduction (one lesson)
--    Chapter 2 = Course Content (two lessons)
WITH course_seed(slug, chapter_title, chapter_position) AS (
    VALUES
      ('academic-mastery', 'Introduction', 1),
      ('academic-mastery', 'IELTS Academic Content', 2),
      ('general-training', 'Introduction', 1),
      ('general-training', 'IELTS General Training Content', 2),
      ('masterclass', 'Introduction', 1),
      ('masterclass', 'Advanced IELTS Content', 2),
      ('vocabulary', 'Introduction', 1),
      ('vocabulary', 'Vocabulary Topics and Practice', 2),
      ('listening', 'Introduction', 1),
      ('listening', 'Listening Practice', 2),
      ('speaking', 'Introduction', 1),
      ('speaking', 'Speaking Practice', 2),
      ('reading', 'Introduction', 1),
      ('reading', 'Reading Practice', 2)
)
INSERT INTO chapters (course_id, title, position)
SELECT c.id, s.chapter_title, s.chapter_position
FROM course_seed s
JOIN courses c ON c.slug = s.slug
ON CONFLICT (course_id, position)
DO UPDATE SET title = EXCLUDED.title;

-- 2. Lessons. Every course gets one introduction lesson and two content lessons.
WITH lesson_seed(
    course_slug, chapter_position, lesson_position, title, content,
    duration_seconds, video_url, slides_url, quiz_url
) AS (
    VALUES
    ('academic-mastery', 1, 1, 'Introduction to IELTS Academic',
     'Overview of IELTS Academic, its four sections, band scoring, and how to use this course.',
     900, '/lesson-assets/academic-mastery-lesson-1.mp4',
     '/lesson-assets/academic-mastery-lesson-1-slides.pdf',
     '/lesson-assets/academic-mastery-lesson-1-quiz.json'),
    ('academic-mastery', 2, 1, 'Grammar Fundamentals for IELTS',
     'Review essential grammar structures for clear, accurate academic English.',
     1500, '/lesson-assets/academic-mastery-lesson-2.mp4',
     '/lesson-assets/academic-mastery-lesson-2-slides.pdf',
     '/lesson-assets/academic-mastery-lesson-2-quiz.json'),
    ('academic-mastery', 2, 2, 'Academic Vocabulary and Task Strategies',
     'Build topic vocabulary and learn practical strategies for IELTS Academic tasks.',
     1200, '/lesson-assets/academic-mastery-lesson-3.mp4',
     '/lesson-assets/academic-mastery-lesson-3-slides.pdf',
     '/lesson-assets/academic-mastery-lesson-3-quiz.json'),

    ('general-training', 1, 1, 'Introduction to IELTS General Training',
     'Understand the General Training test format, sections, scoring, and preparation plan.',
     900, '/lesson-assets/general-training-lesson-1.mp4',
     '/lesson-assets/general-training-lesson-1-slides.pdf',
     '/lesson-assets/general-training-lesson-1-quiz.json'),
    ('general-training', 2, 1, 'Everyday English and Grammar',
     'Practise grammar and language used in everyday, workplace, and social situations.',
     1500, '/lesson-assets/general-training-lesson-2.mp4',
     '/lesson-assets/general-training-lesson-2-slides.pdf',
     '/lesson-assets/general-training-lesson-2-quiz.json'),
    ('general-training', 2, 2, 'Reading and Writing for General Training',
     'Explore practical reading tasks and the structure of letters and short written responses.',
     1200, '/lesson-assets/general-training-lesson-3.mp4',
     '/lesson-assets/general-training-lesson-3-slides.pdf',
     '/lesson-assets/general-training-lesson-3-quiz.json'),

    ('masterclass', 1, 1, 'Welcome to the IELTS Band 8 Masterclass',
     'Learn the course structure and the performance expected at a high IELTS band.',
     900, '/lesson-assets/masterclass-lesson-1.mp4',
     '/lesson-assets/masterclass-lesson-1-slides.pdf',
     '/lesson-assets/masterclass-lesson-1-quiz.json'),
    ('masterclass', 2, 1, 'Advanced Listening and Reading',
     'Develop precision, inference, and time-management strategies for advanced test tasks.',
     1800, '/lesson-assets/masterclass-lesson-2.mp4',
     '/lesson-assets/masterclass-lesson-2-slides.pdf',
     '/lesson-assets/masterclass-lesson-2-quiz.json'),
    ('masterclass', 2, 2, 'High-Band Writing and Speaking',
     'Improve response organisation, lexical precision, fluency, and task achievement.',
     1800, '/lesson-assets/masterclass-lesson-3.mp4',
     '/lesson-assets/masterclass-lesson-3-slides.pdf',
     '/lesson-assets/masterclass-lesson-3-quiz.json'),

    ('vocabulary', 1, 1, 'Introduction to IELTS Vocabulary',
     'Learn how vocabulary range and precision support reading and writing performance.',
     900, '/lesson-assets/vocabulary-lesson-1.mp4',
     '/lesson-assets/vocabulary-lesson-1-slides.pdf',
     '/lesson-assets/vocabulary-lesson-1-quiz.json'),
    ('vocabulary', 2, 1, 'Vocabulary by Common IELTS Topics',
     'Study useful vocabulary for education, work, environment, health, and technology.',
     1200, '/lesson-assets/vocabulary-lesson-2.mp4',
     '/lesson-assets/vocabulary-lesson-2-slides.pdf',
     '/lesson-assets/vocabulary-lesson-2-quiz.json'),
    ('vocabulary', 2, 2, 'Collocations and Academic Word Choice',
     'Practise collocations, paraphrasing, and choosing words appropriate to context.',
     1200, '/lesson-assets/vocabulary-lesson-3.mp4',
     '/lesson-assets/vocabulary-lesson-3-slides.pdf',
     '/lesson-assets/vocabulary-lesson-3-quiz.json'),

    ('listening', 1, 1, 'Introduction to English Listening',
     'Learn a practical routine for listening practice and identifying the main idea.',
     900, '/lesson-assets/listening-lesson-1.mp4',
     '/lesson-assets/listening-lesson-1-slides.pdf',
     '/lesson-assets/listening-lesson-1-quiz.json'),
    ('listening', 2, 1, 'Listening for Key Information',
     'Practise predicting answers, recognising paraphrases, and taking concise notes.',
     1200, '/lesson-assets/listening-lesson-2.mp4',
     '/lesson-assets/listening-lesson-2-slides.pdf',
     '/lesson-assets/listening-lesson-2-quiz.json'),
    ('listening', 2, 2, 'IELTS Listening Question Types',
     'Review multiple choice, form completion, matching, and map-labeling strategies.',
     1500, '/lesson-assets/listening-lesson-3.mp4',
     '/lesson-assets/listening-lesson-3-slides.pdf',
     '/lesson-assets/listening-lesson-3-quiz.json'),

    ('speaking', 1, 1, 'Introduction to Confident English Speaking',
     'Understand the speaking course structure and set goals for clearer communication.',
     900, '/lesson-assets/speaking-lesson-1.mp4',
     '/lesson-assets/speaking-lesson-1-slides.pdf',
     '/lesson-assets/speaking-lesson-1-quiz.json'),
    ('speaking', 2, 1, 'Fluency, Pronunciation, and Vocabulary',
     'Practise organising ideas, connecting speech, and using vocabulary naturally.',
     1500, '/lesson-assets/speaking-lesson-2.mp4',
     '/lesson-assets/speaking-lesson-2-slides.pdf',
     '/lesson-assets/speaking-lesson-2-quiz.json'),
    ('speaking', 2, 2, 'IELTS Speaking Parts 1, 2, and 3',
     'Learn how to answer personal questions, give a long turn, and discuss abstract topics.',
     1500, '/lesson-assets/speaking-lesson-3.mp4',
     '/lesson-assets/speaking-lesson-3-slides.pdf',
     '/lesson-assets/speaking-lesson-3-quiz.json'),

    ('reading', 1, 1, 'Introduction to English Reading',
     'Learn how to approach a passage, identify its main idea, and read with a purpose.',
     900, '/lesson-assets/reading-lesson-1.mp4',
     '/lesson-assets/reading-lesson-1-slides.pdf',
     '/lesson-assets/reading-lesson-1-quiz.json'),
    ('reading', 2, 1, 'Skimming, Scanning, and Finding Evidence',
     'Practise reading quickly for structure and locating specific details efficiently.',
     1200, '/lesson-assets/reading-lesson-2.mp4',
     '/lesson-assets/reading-lesson-2-slides.pdf',
     '/lesson-assets/reading-lesson-2-quiz.json'),
    ('reading', 2, 2, 'Inference and IELTS Reading Question Types',
     'Use evidence to make inferences and answer common IELTS reading question formats.',
     1500, '/lesson-assets/reading-lesson-3.mp4',
     '/lesson-assets/reading-lesson-3-slides.pdf',
     '/lesson-assets/reading-lesson-3-quiz.json')
),
resolved AS (
    SELECT
        c.id AS course_id,
        ch.id AS chapter_id,
        s.lesson_position,
        s.title,
        s.content,
        s.duration_seconds,
        s.video_url,
        s.slides_url,
        s.quiz_url
    FROM lesson_seed s
    JOIN courses c ON c.slug = s.course_slug
    JOIN chapters ch
      ON ch.course_id = c.id
     AND ch.position = s.chapter_position
),
upserted_lessons AS (
    INSERT INTO lessons (
        chapter_id, title, position, is_required,
        required_watch_percentage, status, created_at, updated_at
    )
    SELECT
        chapter_id, title, lesson_position, TRUE,
        90.00, 'published', NOW(), NOW()
    FROM resolved
    ON CONFLICT (chapter_id, position)
    DO UPDATE SET
        title = EXCLUDED.title,
        is_required = EXCLUDED.is_required,
        required_watch_percentage = EXCLUDED.required_watch_percentage,
        status = EXCLUDED.status,
        updated_at = NOW()
    RETURNING id, chapter_id, position
)
SELECT 1;

-- 3. Add videos and learning materials for the seeded lessons.
WITH lesson_seed(
    course_slug, chapter_position, lesson_position, title, content,
    duration_seconds, video_url, slides_url, quiz_url
) AS (
    VALUES
    ('academic-mastery', 1, 1, 'Introduction to IELTS Academic', 'Overview of IELTS Academic, its four sections, band scoring, and how to use this course.', 900, '/lesson-assets/academic-mastery-lesson-1.mp4', '/lesson-assets/academic-mastery-lesson-1-slides.pdf', '/lesson-assets/academic-mastery-lesson-1-quiz.json'),
    ('academic-mastery', 2, 1, 'Grammar Fundamentals for IELTS', 'Review essential grammar structures for clear, accurate academic English.', 1500, '/lesson-assets/academic-mastery-lesson-2.mp4', '/lesson-assets/academic-mastery-lesson-2-slides.pdf', '/lesson-assets/academic-mastery-lesson-2-quiz.json'),
    ('academic-mastery', 2, 2, 'Academic Vocabulary and Task Strategies', 'Build topic vocabulary and learn practical strategies for IELTS Academic tasks.', 1200, '/lesson-assets/academic-mastery-lesson-3.mp4', '/lesson-assets/academic-mastery-lesson-3-slides.pdf', '/lesson-assets/academic-mastery-lesson-3-quiz.json'),
    ('general-training', 1, 1, 'Introduction to IELTS General Training', 'Understand the General Training test format, sections, scoring, and preparation plan.', 900, '/lesson-assets/general-training-lesson-1.mp4', '/lesson-assets/general-training-lesson-1-slides.pdf', '/lesson-assets/general-training-lesson-1-quiz.json'),
    ('general-training', 2, 1, 'Everyday English and Grammar', 'Practise grammar and language used in everyday, workplace, and social situations.', 1500, '/lesson-assets/general-training-lesson-2.mp4', '/lesson-assets/general-training-lesson-2-slides.pdf', '/lesson-assets/general-training-lesson-2-quiz.json'),
    ('general-training', 2, 2, 'Reading and Writing for General Training', 'Explore practical reading tasks and the structure of letters and short written responses.', 1200, '/lesson-assets/general-training-lesson-3.mp4', '/lesson-assets/general-training-lesson-3-slides.pdf', '/lesson-assets/general-training-lesson-3-quiz.json'),
    ('masterclass', 1, 1, 'Welcome to the IELTS Band 8 Masterclass', 'Learn the course structure and the performance expected at a high IELTS band.', 900, '/lesson-assets/masterclass-lesson-1.mp4', '/lesson-assets/masterclass-lesson-1-slides.pdf', '/lesson-assets/masterclass-lesson-1-quiz.json'),
    ('masterclass', 2, 1, 'Advanced Listening and Reading', 'Develop precision, inference, and time-management strategies for advanced test tasks.', 1800, '/lesson-assets/masterclass-lesson-2.mp4', '/lesson-assets/masterclass-lesson-2-slides.pdf', '/lesson-assets/masterclass-lesson-2-quiz.json'),
    ('masterclass', 2, 2, 'High-Band Writing and Speaking', 'Improve response organisation, lexical precision, fluency, and task achievement.', 1800, '/lesson-assets/masterclass-lesson-3.mp4', '/lesson-assets/masterclass-lesson-3-slides.pdf', '/lesson-assets/masterclass-lesson-3-quiz.json'),
    ('vocabulary', 1, 1, 'Introduction to IELTS Vocabulary', 'Learn how vocabulary range and precision support reading and writing performance.', 900, '/lesson-assets/vocabulary-lesson-1.mp4', '/lesson-assets/vocabulary-lesson-1-slides.pdf', '/lesson-assets/vocabulary-lesson-1-quiz.json'),
    ('vocabulary', 2, 1, 'Vocabulary by Common IELTS Topics', 'Study useful vocabulary for education, work, environment, health, and technology.', 1200, '/lesson-assets/vocabulary-lesson-2.mp4', '/lesson-assets/vocabulary-lesson-2-slides.pdf', '/lesson-assets/vocabulary-lesson-2-quiz.json'),
    ('vocabulary', 2, 2, 'Collocations and Academic Word Choice', 'Practise collocations, paraphrasing, and choosing words appropriate to context.', 1200, '/lesson-assets/vocabulary-lesson-3.mp4', '/lesson-assets/vocabulary-lesson-3-slides.pdf', '/lesson-assets/vocabulary-lesson-3-quiz.json'),
    ('listening', 1, 1, 'Introduction to English Listening', 'Learn a practical routine for listening practice and identifying the main idea.', 900, '/lesson-assets/listening-lesson-1.mp4', '/lesson-assets/listening-lesson-1-slides.pdf', '/lesson-assets/listening-lesson-1-quiz.json'),
    ('listening', 2, 1, 'Listening for Key Information', 'Practise predicting answers, recognising paraphrases, and taking concise notes.', 1200, '/lesson-assets/listening-lesson-2.mp4', '/lesson-assets/listening-lesson-2-slides.pdf', '/lesson-assets/listening-lesson-2-quiz.json'),
    ('listening', 2, 2, 'IELTS Listening Question Types', 'Review multiple choice, form completion, matching, and map-labeling strategies.', 1500, '/lesson-assets/listening-lesson-3.mp4', '/lesson-assets/listening-lesson-3-slides.pdf', '/lesson-assets/listening-lesson-3-quiz.json'),
    ('speaking', 1, 1, 'Introduction to Confident English Speaking', 'Understand the speaking course structure and set goals for clearer communication.', 900, '/lesson-assets/speaking-lesson-1.mp4', '/lesson-assets/speaking-lesson-1-slides.pdf', '/lesson-assets/speaking-lesson-1-quiz.json'),
    ('speaking', 2, 1, 'Fluency, Pronunciation, and Vocabulary', 'Practise organising ideas, connecting speech, and using vocabulary naturally.', 1500, '/lesson-assets/speaking-lesson-2.mp4', '/lesson-assets/speaking-lesson-2-slides.pdf', '/lesson-assets/speaking-lesson-2-quiz.json'),
    ('speaking', 2, 2, 'IELTS Speaking Parts 1, 2, and 3', 'Learn how to answer personal questions, give a long turn, and discuss abstract topics.', 1500, '/lesson-assets/speaking-lesson-3.mp4', '/lesson-assets/speaking-lesson-3-slides.pdf', '/lesson-assets/speaking-lesson-3-quiz.json'),
    ('reading', 1, 1, 'Introduction to English Reading', 'Learn how to approach a passage, identify its main idea, and read with a purpose.', 900, '/lesson-assets/reading-lesson-1.mp4', '/lesson-assets/reading-lesson-1-slides.pdf', '/lesson-assets/reading-lesson-1-quiz.json'),
    ('reading', 2, 1, 'Skimming, Scanning, and Finding Evidence', 'Practise reading quickly for structure and locating specific details efficiently.', 1200, '/lesson-assets/reading-lesson-2.mp4', '/lesson-assets/reading-lesson-2-slides.pdf', '/lesson-assets/reading-lesson-2-quiz.json'),
    ('reading', 2, 2, 'Inference and IELTS Reading Question Types', 'Use evidence to make inferences and answer common IELTS reading question formats.', 1500, '/lesson-assets/reading-lesson-3.mp4', '/lesson-assets/reading-lesson-3-slides.pdf', '/lesson-assets/reading-lesson-3-quiz.json')
),
resolved AS (
    SELECT ch.id AS chapter_id, ls.lesson_position, ls.content,
           ls.duration_seconds, ls.video_url, ls.slides_url, ls.quiz_url,
           l.id AS lesson_id
    FROM lesson_seed ls
    JOIN courses c ON c.slug = ls.course_slug
    JOIN chapters ch ON ch.course_id = c.id AND ch.position = ls.chapter_position
    JOIN lessons l ON l.chapter_id = ch.id AND l.position = ls.lesson_position
)
INSERT INTO videos (lesson_id, video_url, duration_seconds, created_at)
SELECT lesson_id, video_url, duration_seconds, NOW()
FROM resolved
ON CONFLICT (lesson_id)
DO UPDATE SET
    video_url = EXCLUDED.video_url,
    duration_seconds = EXCLUDED.duration_seconds;

WITH lesson_seed(
    course_slug, chapter_position, lesson_position, title, content,
    duration_seconds, video_url, slides_url, quiz_url
) AS (
    VALUES
    ('academic-mastery', 1, 1, 'Introduction to IELTS Academic', 'Overview of IELTS Academic, its four sections, band scoring, and how to use this course.', 900, '/lesson-assets/academic-mastery-lesson-1.mp4', '/lesson-assets/academic-mastery-lesson-1-slides.pdf', '/lesson-assets/academic-mastery-lesson-1-quiz.json'),
    ('academic-mastery', 2, 1, 'Grammar Fundamentals for IELTS', 'Review essential grammar structures for clear, accurate academic English.', 1500, '/lesson-assets/academic-mastery-lesson-2.mp4', '/lesson-assets/academic-mastery-lesson-2-slides.pdf', '/lesson-assets/academic-mastery-lesson-2-quiz.json'),
    ('academic-mastery', 2, 2, 'Academic Vocabulary and Task Strategies', 'Build topic vocabulary and learn practical strategies for IELTS Academic tasks.', 1200, '/lesson-assets/academic-mastery-lesson-3.mp4', '/lesson-assets/academic-mastery-lesson-3-slides.pdf', '/lesson-assets/academic-mastery-lesson-3-quiz.json'),
    ('general-training', 1, 1, 'Introduction to IELTS General Training', 'Understand the General Training test format, sections, scoring, and preparation plan.', 900, '/lesson-assets/general-training-lesson-1.mp4', '/lesson-assets/general-training-lesson-1-slides.pdf', '/lesson-assets/general-training-lesson-1-quiz.json'),
    ('general-training', 2, 1, 'Everyday English and Grammar', 'Practise grammar and language used in everyday, workplace, and social situations.', 1500, '/lesson-assets/general-training-lesson-2.mp4', '/lesson-assets/general-training-lesson-2-slides.pdf', '/lesson-assets/general-training-lesson-2-quiz.json'),
    ('general-training', 2, 2, 'Reading and Writing for General Training', 'Explore practical reading tasks and the structure of letters and short written responses.', 1200, '/lesson-assets/general-training-lesson-3.mp4', '/lesson-assets/general-training-lesson-3-slides.pdf', '/lesson-assets/general-training-lesson-3-quiz.json'),
    ('masterclass', 1, 1, 'Welcome to the IELTS Band 8 Masterclass', 'Learn the course structure and the performance expected at a high IELTS band.', 900, '/lesson-assets/masterclass-lesson-1.mp4', '/lesson-assets/masterclass-lesson-1-slides.pdf', '/lesson-assets/masterclass-lesson-1-quiz.json'),
    ('masterclass', 2, 1, 'Advanced Listening and Reading', 'Develop precision, inference, and time-management strategies for advanced test tasks.', 1800, '/lesson-assets/masterclass-lesson-2.mp4', '/lesson-assets/masterclass-lesson-2-slides.pdf', '/lesson-assets/masterclass-lesson-2-quiz.json'),
    ('masterclass', 2, 2, 'High-Band Writing and Speaking', 'Improve response organisation, lexical precision, fluency, and task achievement.', 1800, '/lesson-assets/masterclass-lesson-3.mp4', '/lesson-assets/masterclass-lesson-3-slides.pdf', '/lesson-assets/masterclass-lesson-3-quiz.json'),
    ('vocabulary', 1, 1, 'Introduction to IELTS Vocabulary', 'Learn how vocabulary range and precision support reading and writing performance.', 900, '/lesson-assets/vocabulary-lesson-1.mp4', '/lesson-assets/vocabulary-lesson-1-slides.pdf', '/lesson-assets/vocabulary-lesson-1-quiz.json'),
    ('vocabulary', 2, 1, 'Vocabulary by Common IELTS Topics', 'Study useful vocabulary for education, work, environment, health, and technology.', 1200, '/lesson-assets/vocabulary-lesson-2.mp4', '/lesson-assets/vocabulary-lesson-2-slides.pdf', '/lesson-assets/vocabulary-lesson-2-quiz.json'),
    ('vocabulary', 2, 2, 'Collocations and Academic Word Choice', 'Practise collocations, paraphrasing, and choosing words appropriate to context.', 1200, '/lesson-assets/vocabulary-lesson-3.mp4', '/lesson-assets/vocabulary-lesson-3-slides.pdf', '/lesson-assets/vocabulary-lesson-3-quiz.json'),
    ('listening', 1, 1, 'Introduction to English Listening', 'Learn a practical routine for listening practice and identifying the main idea.', 900, '/lesson-assets/listening-lesson-1.mp4', '/lesson-assets/listening-lesson-1-slides.pdf', '/lesson-assets/listening-lesson-1-quiz.json'),
    ('listening', 2, 1, 'Listening for Key Information', 'Practise predicting answers, recognising paraphrases, and taking concise notes.', 1200, '/lesson-assets/listening-lesson-2.mp4', '/lesson-assets/listening-lesson-2-slides.pdf', '/lesson-assets/listening-lesson-2-quiz.json'),
    ('listening', 2, 2, 'IELTS Listening Question Types', 'Review multiple choice, form completion, matching, and map-labeling strategies.', 1500, '/lesson-assets/listening-lesson-3.mp4', '/lesson-assets/listening-lesson-3-slides.pdf', '/lesson-assets/listening-lesson-3-quiz.json'),
    ('speaking', 1, 1, 'Introduction to Confident English Speaking', 'Understand the speaking course structure and set goals for clearer communication.', 900, '/lesson-assets/speaking-lesson-1.mp4', '/lesson-assets/speaking-lesson-1-slides.pdf', '/lesson-assets/speaking-lesson-1-quiz.json'),
    ('speaking', 2, 1, 'Fluency, Pronunciation, and Vocabulary', 'Practise organising ideas, connecting speech, and using vocabulary naturally.', 1500, '/lesson-assets/speaking-lesson-2.mp4', '/lesson-assets/speaking-lesson-2-slides.pdf', '/lesson-assets/speaking-lesson-2-quiz.json'),
    ('speaking', 2, 2, 'IELTS Speaking Parts 1, 2, and 3', 'Learn how to answer personal questions, give a long turn, and discuss abstract topics.', 1500, '/lesson-assets/speaking-lesson-3.mp4', '/lesson-assets/speaking-lesson-3-slides.pdf', '/lesson-assets/speaking-lesson-3-quiz.json'),
    ('reading', 1, 1, 'Introduction to English Reading', 'Learn how to approach a passage, identify its main idea, and read with a purpose.', 900, '/lesson-assets/reading-lesson-1.mp4', '/lesson-assets/reading-lesson-1-slides.pdf', '/lesson-assets/reading-lesson-1-quiz.json'),
    ('reading', 2, 1, 'Skimming, Scanning, and Finding Evidence', 'Practise reading quickly for structure and locating specific details efficiently.', 1200, '/lesson-assets/reading-lesson-2.mp4', '/lesson-assets/reading-lesson-2-slides.pdf', '/lesson-assets/reading-lesson-2-quiz.json'),
    ('reading', 2, 2, 'Inference and IELTS Reading Question Types', 'Use evidence to make inferences and answer common IELTS reading question formats.', 1500, '/lesson-assets/reading-lesson-3.mp4', '/lesson-assets/reading-lesson-3-slides.pdf', '/lesson-assets/reading-lesson-3-quiz.json')
),
resolved AS (
    SELECT l.id AS lesson_id, ls.title, ls.content, ls.slides_url, ls.quiz_url
    FROM lesson_seed ls
    JOIN courses c ON c.slug = ls.course_slug
    JOIN chapters ch ON ch.course_id = c.id AND ch.position = ls.chapter_position
    JOIN lessons l ON l.chapter_id = ch.id AND l.position = ls.lesson_position
)
INSERT INTO lesson_materials (
    lesson_id, title, material_type, resource_url, text_content,
    mime_type, duration_seconds, is_required, position
)
SELECT lesson_id, title || ' - Lesson Notes', 'text', NULL, content,
       'text/plain', NULL, TRUE, 1
FROM resolved
ON CONFLICT (lesson_id, position)
DO UPDATE SET
    title = EXCLUDED.title,
    material_type = EXCLUDED.material_type,
    resource_url = EXCLUDED.resource_url,
    text_content = EXCLUDED.text_content,
    mime_type = EXCLUDED.mime_type,
    is_required = EXCLUDED.is_required;

WITH lesson_seed(course_slug, chapter_position, lesson_position, title, slides_url, quiz_url) AS (
    VALUES
    ('academic-mastery',1,1,'Introduction to IELTS Academic','/lesson-assets/academic-mastery-lesson-1-slides.pdf','/lesson-assets/academic-mastery-lesson-1-quiz.json'),
    ('academic-mastery',2,1,'Grammar Fundamentals for IELTS','/lesson-assets/academic-mastery-lesson-2-slides.pdf','/lesson-assets/academic-mastery-lesson-2-quiz.json'),
    ('academic-mastery',2,2,'Academic Vocabulary and Task Strategies','/lesson-assets/academic-mastery-lesson-3-slides.pdf','/lesson-assets/academic-mastery-lesson-3-quiz.json'),
    ('general-training',1,1,'Introduction to IELTS General Training','/lesson-assets/general-training-lesson-1-slides.pdf','/lesson-assets/general-training-lesson-1-quiz.json'),
    ('general-training',2,1,'Everyday English and Grammar','/lesson-assets/general-training-lesson-2-slides.pdf','/lesson-assets/general-training-lesson-2-quiz.json'),
    ('general-training',2,2,'Reading and Writing for General Training','/lesson-assets/general-training-lesson-3-slides.pdf','/lesson-assets/general-training-lesson-3-quiz.json'),
    ('masterclass',1,1,'Welcome to the IELTS Band 8 Masterclass','/lesson-assets/masterclass-lesson-1-slides.pdf','/lesson-assets/masterclass-lesson-1-quiz.json'),
    ('masterclass',2,1,'Advanced Listening and Reading','/lesson-assets/masterclass-lesson-2-slides.pdf','/lesson-assets/masterclass-lesson-2-quiz.json'),
    ('masterclass',2,2,'High-Band Writing and Speaking','/lesson-assets/masterclass-lesson-3-slides.pdf','/lesson-assets/masterclass-lesson-3-quiz.json'),
    ('vocabulary',1,1,'Introduction to IELTS Vocabulary','/lesson-assets/vocabulary-lesson-1-slides.pdf','/lesson-assets/vocabulary-lesson-1-quiz.json'),
    ('vocabulary',2,1,'Vocabulary by Common IELTS Topics','/lesson-assets/vocabulary-lesson-2-slides.pdf','/lesson-assets/vocabulary-lesson-2-quiz.json'),
    ('vocabulary',2,2,'Collocations and Academic Word Choice','/lesson-assets/vocabulary-lesson-3-slides.pdf','/lesson-assets/vocabulary-lesson-3-quiz.json'),
    ('listening',1,1,'Introduction to English Listening','/lesson-assets/listening-lesson-1-slides.pdf','/lesson-assets/listening-lesson-1-quiz.json'),
    ('listening',2,1,'Listening for Key Information','/lesson-assets/listening-lesson-2-slides.pdf','/lesson-assets/listening-lesson-2-quiz.json'),
    ('listening',2,2,'IELTS Listening Question Types','/lesson-assets/listening-lesson-3-slides.pdf','/lesson-assets/listening-lesson-3-quiz.json'),
    ('speaking',1,1,'Introduction to Confident English Speaking','/lesson-assets/speaking-lesson-1-slides.pdf','/lesson-assets/speaking-lesson-1-quiz.json'),
    ('speaking',2,1,'Fluency, Pronunciation, and Vocabulary','/lesson-assets/speaking-lesson-2-slides.pdf','/lesson-assets/speaking-lesson-2-quiz.json'),
    ('speaking',2,2,'IELTS Speaking Parts 1, 2, and 3','/lesson-assets/speaking-lesson-3-slides.pdf','/lesson-assets/speaking-lesson-3-quiz.json'),
    ('reading',1,1,'Introduction to English Reading','/lesson-assets/reading-lesson-1-slides.pdf','/lesson-assets/reading-lesson-1-quiz.json'),
    ('reading',2,1,'Skimming, Scanning, and Finding Evidence','/lesson-assets/reading-lesson-2-slides.pdf','/lesson-assets/reading-lesson-2-quiz.json'),
    ('reading',2,2,'Inference and IELTS Reading Question Types','/lesson-assets/reading-lesson-3-slides.pdf','/lesson-assets/reading-lesson-3-quiz.json')
),
resolved AS (
    SELECT l.id AS lesson_id, ls.title, ls.slides_url, ls.quiz_url
    FROM lesson_seed ls
    JOIN courses c ON c.slug = ls.course_slug
    JOIN chapters ch ON ch.course_id = c.id AND ch.position = ls.chapter_position
    JOIN lessons l ON l.chapter_id = ch.id AND l.position = ls.lesson_position
)
INSERT INTO lesson_materials (
    lesson_id, title, material_type, resource_url, text_content,
    mime_type, duration_seconds, is_required, position
)
SELECT lesson_id, title || ' - Slides', 'slides', slides_url, NULL,
       'application/pdf', NULL, FALSE, 2
FROM resolved
ON CONFLICT (lesson_id, position)
DO UPDATE SET title = EXCLUDED.title, material_type = EXCLUDED.material_type,
    resource_url = EXCLUDED.resource_url, text_content = NULL,
    mime_type = EXCLUDED.mime_type, is_required = EXCLUDED.is_required;

WITH lesson_seed(course_slug, chapter_position, lesson_position, title, slides_url, quiz_url) AS (
    VALUES
    ('academic-mastery',1,1,'Introduction to IELTS Academic','/lesson-assets/academic-mastery-lesson-1-slides.pdf','/lesson-assets/academic-mastery-lesson-1-quiz.json'),
    ('academic-mastery',2,1,'Grammar Fundamentals for IELTS','/lesson-assets/academic-mastery-lesson-2-slides.pdf','/lesson-assets/academic-mastery-lesson-2-quiz.json'),
    ('academic-mastery',2,2,'Academic Vocabulary and Task Strategies','/lesson-assets/academic-mastery-lesson-3-slides.pdf','/lesson-assets/academic-mastery-lesson-3-quiz.json'),
    ('general-training',1,1,'Introduction to IELTS General Training','/lesson-assets/general-training-lesson-1-slides.pdf','/lesson-assets/general-training-lesson-1-quiz.json'),
    ('general-training',2,1,'Everyday English and Grammar','/lesson-assets/general-training-lesson-2-slides.pdf','/lesson-assets/general-training-lesson-2-quiz.json'),
    ('general-training',2,2,'Reading and Writing for General Training','/lesson-assets/general-training-lesson-3-slides.pdf','/lesson-assets/general-training-lesson-3-quiz.json'),
    ('masterclass',1,1,'Welcome to the IELTS Band 8 Masterclass','/lesson-assets/masterclass-lesson-1-slides.pdf','/lesson-assets/masterclass-lesson-1-quiz.json'),
    ('masterclass',2,1,'Advanced Listening and Reading','/lesson-assets/masterclass-lesson-2-slides.pdf','/lesson-assets/masterclass-lesson-2-quiz.json'),
    ('masterclass',2,2,'High-Band Writing and Speaking','/lesson-assets/masterclass-lesson-3-slides.pdf','/lesson-assets/masterclass-lesson-3-quiz.json'),
    ('vocabulary',1,1,'Introduction to IELTS Vocabulary','/lesson-assets/vocabulary-lesson-1-slides.pdf','/lesson-assets/vocabulary-lesson-1-quiz.json'),
    ('vocabulary',2,1,'Vocabulary by Common IELTS Topics','/lesson-assets/vocabulary-lesson-2-slides.pdf','/lesson-assets/vocabulary-lesson-2-quiz.json'),
    ('vocabulary',2,2,'Collocations and Academic Word Choice','/lesson-assets/vocabulary-lesson-3-slides.pdf','/lesson-assets/vocabulary-lesson-3-quiz.json'),
    ('listening',1,1,'Introduction to English Listening','/lesson-assets/listening-lesson-1-slides.pdf','/lesson-assets/listening-lesson-1-quiz.json'),
    ('listening',2,1,'Listening for Key Information','/lesson-assets/listening-lesson-2-slides.pdf','/lesson-assets/listening-lesson-2-quiz.json'),
    ('listening',2,2,'IELTS Listening Question Types','/lesson-assets/listening-lesson-3-slides.pdf','/lesson-assets/listening-lesson-3-quiz.json'),
    ('speaking',1,1,'Introduction to Confident English Speaking','/lesson-assets/speaking-lesson-1-slides.pdf','/lesson-assets/speaking-lesson-1-quiz.json'),
    ('speaking',2,1,'Fluency, Pronunciation, and Vocabulary','/lesson-assets/speaking-lesson-2-slides.pdf','/lesson-assets/speaking-lesson-2-quiz.json'),
    ('speaking',2,2,'IELTS Speaking Parts 1, 2, and 3','/lesson-assets/speaking-lesson-3-slides.pdf','/lesson-assets/speaking-lesson-3-quiz.json'),
    ('reading',1,1,'Introduction to English Reading','/lesson-assets/reading-lesson-1-slides.pdf','/lesson-assets/reading-lesson-1-quiz.json'),
    ('reading',2,1,'Skimming, Scanning, and Finding Evidence','/lesson-assets/reading-lesson-2-slides.pdf','/lesson-assets/reading-lesson-2-quiz.json'),
    ('reading',2,2,'Inference and IELTS Reading Question Types','/lesson-assets/reading-lesson-3-slides.pdf','/lesson-assets/reading-lesson-3-quiz.json')
),
resolved AS (
    SELECT l.id AS lesson_id, ls.title, ls.quiz_url
    FROM lesson_seed ls
    JOIN courses c ON c.slug = ls.course_slug
    JOIN chapters ch ON ch.course_id = c.id AND ch.position = ls.chapter_position
    JOIN lessons l ON l.chapter_id = ch.id AND l.position = ls.lesson_position
)
INSERT INTO lesson_materials (
    lesson_id, title, material_type, resource_url, text_content,
    mime_type, duration_seconds, is_required, position
)
SELECT lesson_id, title || ' - Quiz Resource', 'file', quiz_url, NULL,
       'application/json', NULL, FALSE, 3
FROM resolved
ON CONFLICT (lesson_id, position)
DO UPDATE SET title = EXCLUDED.title, material_type = EXCLUDED.material_type,
    resource_url = EXCLUDED.resource_url, text_content = NULL,
    mime_type = EXCLUDED.mime_type, is_required = EXCLUDED.is_required;

-- 4. Verify the resulting chapter/lesson structure.
SELECT c.slug AS course_slug, ch.position AS chapter_position,
       ch.title AS chapter_title, l.position AS lesson_position,
       l.title AS lesson_title
FROM courses c
JOIN chapters ch ON ch.course_id = c.id
JOIN lessons l ON l.chapter_id = ch.id
WHERE c.slug IN (
    'academic-mastery', 'general-training', 'masterclass',
    'vocabulary', 'listening', 'speaking', 'reading'
)
ORDER BY c.slug, ch.position, l.position;

COMMIT;
