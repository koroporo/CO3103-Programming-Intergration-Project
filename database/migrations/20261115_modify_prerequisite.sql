-- ============================================================
-- 20261115_modify_prerequisite.sql
-- Modify course_prerequisites:
--   OLD: course -> prerequisite course
--   NEW: course -> prerequisite skill + minimum IELTS band
-- ============================================================


-- 1. Remove the old primary key
--    Old PK: (course_id, prerequisite_course_id)
ALTER TABLE "course_prerequisites"
DROP CONSTRAINT "course_prerequisites_pkey";


-- 2. Remove the old prerequisite_course_id column
ALTER TABLE "course_prerequisites"
DROP COLUMN "prerequisite_course_id";


-- 3. Add the prerequisite skill
ALTER TABLE "course_prerequisites"
ADD COLUMN "skill_id" BIGINT NOT NULL;


-- 4. Add the minimum IELTS band required
ALTER TABLE "course_prerequisites"
ADD COLUMN "minimum_band" NUMERIC(3,1) NOT NULL;


-- 5. Add the new primary key
--    One course can have at most one prerequisite
--    for each skill.
ALTER TABLE "course_prerequisites"
ADD CONSTRAINT "course_prerequisites_pkey"
PRIMARY KEY ("course_id", "skill_id");


-- 6. Foreign key: course_prerequisites -> courses
ALTER TABLE "course_prerequisites"
ADD CONSTRAINT "fk_course_prerequisites_course"
FOREIGN KEY ("course_id")
REFERENCES "courses"("id")
ON DELETE CASCADE;


-- 7. Foreign key: course_prerequisites -> skills
ALTER TABLE "course_prerequisites"
ADD CONSTRAINT "fk_course_prerequisites_skill"
FOREIGN KEY ("skill_id")
REFERENCES "skills"("id")
ON DELETE CASCADE;


-- 8. Make sure the prerequisite band is valid
--    IELTS band: 1.0 - 8.0
ALTER TABLE "course_prerequisites"
ADD CONSTRAINT "chk_course_prerequisites_minimum_band"
CHECK (
    "minimum_band" BETWEEN 1.0 AND 8.0
);