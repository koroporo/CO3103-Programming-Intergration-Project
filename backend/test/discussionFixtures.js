async function seedDiscussions(database) {
  await database.query(`
    TRUNCATE accounts, categories CASCADE;
    INSERT INTO accounts (id, email, password_hash, full_name, role, status, created_at, updated_at)
    VALUES (10, 'learner@example.test', 'test-only', 'Learner One', 'learner', 'active', NOW(), NOW()),
      (11, 'other@example.test', 'test-only', 'Learner Two', 'learner', 'active', NOW(), NOW()),
      (12, 'instructor@example.test', 'test-only', 'Course Instructor', 'instructor', 'active', NOW(), NOW()),
      (13, 'foreign@example.test', 'test-only', 'Other Instructor', 'instructor', 'active', NOW(), NOW()),
      (14, 'admin@example.test', 'test-only', 'Admin', 'admin', 'active', NOW(), NOW()),
      (15, 'user@example.test', 'test-only', 'User', 'user', 'active', NOW(), NOW()),
      (16, 'outsider@example.test', 'test-only', 'Outsider', 'learner', 'active', NOW(), NOW()),
      (17, 'suspended@example.test', 'test-only', 'Suspended', 'learner', 'suspended', NOW(), NOW()),
      (18, 'completed@example.test', 'test-only', 'Graduate', 'learner', 'active', NOW(), NOW()),
      (19, 'withdrawn@example.test', 'test-only', 'Withdrawn', 'learner', 'active', NOW(), NOW());
    INSERT INTO categories (id, name, slug) VALUES (1, 'Test', 'test');
    INSERT INTO courses (id, instructor_id, category_id, title, slug, description, status, is_featured, created_at, updated_at)
    VALUES (20, 12, 1, 'Course', 'course', 'Test course', 'published', FALSE, NOW(), NOW()),
      (21, 13, 1, 'Other course', 'other-course', 'Other course', 'published', FALSE, NOW(), NOW());
    INSERT INTO chapters (id, course_id, title, position) VALUES (30, 20, 'Chapter', 1), (31, 21, 'Other', 1);
    INSERT INTO lessons (id, chapter_id, title, position, is_required, required_watch_percentage, status, created_at, updated_at)
    VALUES (40, 30, 'Lesson One', 1, TRUE, 80, 'published', NOW(), NOW()),
      (41, 31, 'Other lesson', 1, TRUE, 80, 'published', NOW(), NOW()),
      (42, 30, 'Lesson Two', 2, TRUE, 80, 'published', NOW(), NOW());
    INSERT INTO enrollments (learner_id, course_id, status, enrolled_at)
    VALUES (10, 20, 'active', NOW()), (11, 20, 'active', NOW()),
      (17, 20, 'active', NOW()), (18, 20, 'completed', NOW()), (19, 20, 'withdrawn', NOW());
  `);
}

module.exports = { seedDiscussions };
