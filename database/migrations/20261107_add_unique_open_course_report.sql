CREATE UNIQUE INDEX uq_content_reports_open_course
ON content_reports (reporter_id, course_id)
WHERE course_id IS NOT NULL
  AND status IN ('pending', 'reviewing');