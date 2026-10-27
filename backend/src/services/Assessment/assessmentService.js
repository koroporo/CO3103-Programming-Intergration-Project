const pool = require("../../db");
const { createError, assertCourseOwner } = require("../../ultils/courseUltils");
const {
  positiveId,
  validateAssessmentInput,
  validateAnswers
} = require("../assessmentValidation");
const { gradeAttempt } = require("./assessmentRules");

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to roll back assessment transaction:", rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

function readJson(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

async function getAuthoringData(instructorId) {
  const coursesResult = await pool.query(
    `SELECT id, title
     FROM courses
     WHERE instructor_id = $1
     ORDER BY title, id`,
    [instructorId]
  );
  const lessonsResult = await pool.query(
    `SELECT lessons.id, lessons.title, chapters.course_id
     FROM lessons
     JOIN chapters ON chapters.id = lessons.chapter_id
     JOIN courses ON courses.id = chapters.course_id
     WHERE courses.instructor_id = $1
     ORDER BY chapters.position, lessons.position, lessons.id`,
    [instructorId]
  );
  const skillsResult = await pool.query(
    `SELECT lesson_skills.lesson_id, skills.id, skills.name
     FROM lesson_skills
     JOIN skills ON skills.id = lesson_skills.skill_id
     JOIN lessons ON lessons.id = lesson_skills.lesson_id
     JOIN chapters ON chapters.id = lessons.chapter_id
     JOIN courses ON courses.id = chapters.course_id
     WHERE courses.instructor_id = $1
     UNION
     SELECT lessons.id AS lesson_id, skills.id, skills.name
     FROM lessons
     JOIN chapters ON chapters.id = lessons.chapter_id
     JOIN courses ON courses.id = chapters.course_id
     JOIN course_skills ON course_skills.course_id = courses.id
     JOIN skills ON skills.id = course_skills.skill_id
     WHERE courses.instructor_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM lesson_skills
         WHERE lesson_skills.lesson_id = lessons.id
       )
     ORDER BY lesson_id, name`,
    [instructorId]
  );

  const skillsByLesson = new Map();
  for (const skill of skillsResult.rows) {
    const lessonKey = String(skill.lesson_id);
    const skills = skillsByLesson.get(lessonKey) ?? [];
    skills.push({ id: String(skill.id), name: skill.name });
    skillsByLesson.set(lessonKey, skills);
  }

  const coursesById = new Map(
    coursesResult.rows.map((course) => [
      String(course.id),
      { id: String(course.id), title: course.title, lessons: [] }
    ])
  );

  for (const lesson of lessonsResult.rows) {
    const course = coursesById.get(String(lesson.course_id));
    if (course) {
      course.lessons.push({
        id: String(lesson.id),
        title: lesson.title,
        skills: skillsByLesson.get(String(lesson.id)) ?? []
      });
    }
  }

  return [...coursesById.values()];
}

async function createAssessment(body, user) {
  const data = validateAssessmentInput(body);

  return withTransaction(async (client) => {
    const lessonResult = await client.query(
      `SELECT lessons.id, courses.id AS course_id,
              courses.instructor_id, courses.status
       FROM courses
       JOIN chapters ON chapters.course_id = courses.id
       JOIN lessons ON lessons.chapter_id = chapters.id
       WHERE courses.id = $1
         AND lessons.id = $2
       FOR SHARE OF courses, lessons`,
      [data.courseId, data.lessonId]
    );

    if (lessonResult.rowCount === 0) {
      throw createError(404, "Course lesson not found");
    }
    assertCourseOwner(lessonResult.rows[0], user);

    const validSkillsResult = await client.query(
      `SELECT skill_id
       FROM lesson_skills
       WHERE lesson_id = $1
       UNION
       SELECT course_skills.skill_id
       FROM course_skills
       WHERE course_id = $2
         AND NOT EXISTS (
           SELECT 1 FROM lesson_skills
           WHERE lesson_id = $1
         )`,
      [data.lessonId, data.courseId]
    );
    const validSkills = new Set(validSkillsResult.rows.map((row) => String(row.skill_id)));
    for (const question of data.questions) {
      if (!validSkills.has(question.skillId)) {
        throw createError(400, `Skill ${question.skillId} is not linked to the selected lesson or course`);
      }
    }

    const bankResult = await client.query(
      `INSERT INTO question_banks (owner_id, course_id, name, description, status, created_at)
       VALUES ($1, $2, $3, $4, 'active', NOW())
       RETURNING id`,
      [user.id, data.courseId, data.title.slice(0, 200), "Question bank generated for this lesson quiz"]
    );
    const bankId = bankResult.rows[0].id;
    const assessmentResult = await client.query(
      `INSERT INTO assessments (
         creator_id, course_id, lesson_id, title, purpose, response_mode,
         status, is_required, question_count, time_limit_seconds, max_attempts,
         passing_percent, created_at
       ) VALUES (
         $1, $2, $3, $4, 'lesson_quiz', 'quiz', 'published', TRUE, $5, $6, $7, $8, NOW()
       )
       RETURNING id, title, course_id, lesson_id, status, question_count,
                 time_limit_seconds, max_attempts, passing_percent`,
      [
        user.id,
        data.courseId,
        data.lessonId,
        data.title,
        data.questions.length,
        data.timeLimit,
        data.maxAttempts,
        data.passingPercent
      ]
    );
    const assessment = assessmentResult.rows[0];

    for (const question of data.questions) {
      const questionResult = await client.query(
        `INSERT INTO questions (
           question_bank_id, creator_id, skill_id, source_lesson_id, question_type,
           prompt, answer_key, difficulty_rating, status, created_at
         ) VALUES ($1, $2, $3, $4, 'single_choice', $5, '{}'::jsonb, 0, 'active', NOW())
         RETURNING id`,
        [bankId, user.id, question.skillId, data.lessonId, question.prompt]
      );
      const questionId = questionResult.rows[0].id;
      let correctOption = null;

      for (const [index, option] of question.options.entries()) {
        const optionResult = await client.query(
          `INSERT INTO question_options (question_id, option_text, is_correct, position)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [questionId, option.text, option.isCorrect, index + 1]
        );
        if (option.isCorrect) {
          correctOption = { id: String(optionResult.rows[0].id), text: option.text };
        }
      }

      await client.query(
        `UPDATE questions
         SET answer_key = $2::jsonb
         WHERE id = $1`,
        [questionId, JSON.stringify({ correct_option_id: correctOption.id, correct_option_text: correctOption.text })]
      );
      await client.query(
        `INSERT INTO assessment_questions (assessment_id, question_id, max_points, is_required)
         VALUES ($1, $2, 1, TRUE)`,
        [assessment.id, questionId]
      );
    }

    return assessment;
  });
}

async function listAvailableAssessments(learnerId) {
  const result = await pool.query(
    `SELECT assessments.id, assessments.title, assessments.course_id,
            courses.title AS course_title, assessments.lesson_id,
            lessons.title AS lesson_title, assessments.question_count,
            assessments.time_limit_seconds, assessments.max_attempts,
            assessments.passing_percent, assessments.opens_at, assessments.due_at
     FROM assessments
     JOIN courses ON courses.id = assessments.course_id
     JOIN lessons ON lessons.id = assessments.lesson_id
     JOIN enrollments ON enrollments.course_id = assessments.course_id
                    AND enrollments.learner_id = $1
                    AND enrollments.status = 'active'
     WHERE assessments.status = 'published'
       AND (assessments.opens_at IS NULL OR assessments.opens_at <= NOW())
       AND (assessments.due_at IS NULL OR assessments.due_at > NOW())
     ORDER BY courses.title, lessons.id, assessments.created_at DESC`,
    [learnerId]
  );

  return result.rows;
}

async function getAttemptQuestions(client, attemptId) {
  const result = await client.query(
    `SELECT attempt_questions.id, attempt_questions.position,
            attempt_questions.question_snapshot, attempt_answers.answer_payload
     FROM attempt_questions
     LEFT JOIN attempt_answers ON attempt_answers.attempt_question_id = attempt_questions.id
     WHERE attempt_questions.attempt_id = $1
     ORDER BY attempt_questions.position`,
    [attemptId]
  );

  return result.rows.map((row) => {
    const snapshot = readJson(row.question_snapshot);
    const answer = row.answer_payload ? readJson(row.answer_payload) : null;
    return {
      attempt_question_id: String(row.id),
      position: row.position,
      prompt: snapshot.prompt,
      question_type: snapshot.question_type,
      options: snapshot.options,
      selected_option_id: answer?.selected_option_id ?? null
    };
  });
}

async function getAttemptForLearner(attemptId, learnerId) {
  const attemptResult = await pool.query(
    `SELECT assessment_attempts.id, assessment_attempts.assessment_id,
          assessment_attempts.attempt_number, assessment_attempts.status,
          assessment_attempts.started_at, assessment_attempts.expires_at,
          assessments.title
     FROM assessment_attempts
     JOIN assessments ON assessments.id = assessment_attempts.assessment_id
     WHERE assessment_attempts.id = $1 AND assessment_attempts.learner_id = $2`,
    [attemptId, learnerId]
  );
  if (attemptResult.rowCount === 0) {
    throw createError(404, "Assessment attempt not found");
  }

  const attempt = attemptResult.rows[0];
  if (attempt.status !== "in_progress") {
    throw createError(409, "This assessment attempt is no longer in progress");
  }

  const questions = await getAttemptQuestions(pool, attemptId);
  return { ...attempt, questions };
}

async function startAttempt(assessmentId, learnerId) {
  const id = positiveId(assessmentId, "assessmentId");

  const attempt = await withTransaction(async (client) => {
    const assessmentResult = await client.query(
      `SELECT id, course_id, lesson_id, assigned_learner_id, question_count,
              time_limit_seconds, max_attempts, passing_percent, opens_at, due_at,
              (opens_at IS NOT NULL AND opens_at > NOW()) AS not_open,
              (due_at IS NOT NULL AND due_at <= NOW()) AS is_due
       FROM assessments
       WHERE id = $1 AND status = 'published'
       FOR UPDATE`,
      [id]
    );
    if (assessmentResult.rowCount === 0) {
      throw createError(404, "Published assessment not found");
    }
    const assessment = assessmentResult.rows[0];

    if (assessment.not_open) {
      throw createError(409, "This assessment is not open yet");
    }
    if (assessment.is_due) {
      throw createError(409, "The assessment deadline has passed");
    }
    if (assessment.assigned_learner_id && String(assessment.assigned_learner_id) !== String(learnerId)) {
      throw createError(403, "This assessment is assigned to another learner");
    }

    const enrollmentResult = await client.query(
      `SELECT id
       FROM enrollments
       WHERE learner_id = $1 AND course_id = $2 AND status = 'active'
       FOR UPDATE`,
      [learnerId, assessment.course_id]
    );
    if (enrollmentResult.rowCount === 0) {
      throw createError(403, "An active course enrollment is required");
    }
    const enrollmentId = enrollmentResult.rows[0].id;

    const existingResult = await client.query(
      `SELECT id, (expires_at <= NOW()) AS is_expired
       FROM assessment_attempts
       WHERE assessment_id = $1 AND learner_id = $2 AND status = 'in_progress'
       ORDER BY attempt_number DESC
       LIMIT 1`,
      [id, learnerId]
    );
    if (existingResult.rowCount > 0 && !existingResult.rows[0].is_expired) {
      const attempt = await client.query(
        `SELECT assessment_attempts.id, assessment_attempts.assessment_id,
                assessment_attempts.attempt_number, assessment_attempts.status,
                assessment_attempts.started_at, assessment_attempts.expires_at,
                assessments.title
         FROM assessment_attempts
         JOIN assessments ON assessments.id = assessment_attempts.assessment_id
         WHERE assessment_attempts.id = $1
           AND assessment_attempts.learner_id = $2`,
        [existingResult.rows[0].id, learnerId]
      );
      return {
        ...attempt.rows[0],
        questions: await getAttemptQuestions(client, existingResult.rows[0].id)
      };
    }

    if (existingResult.rowCount > 0) {
      await finalizeAttempt(client, existingResult.rows[0].id, learnerId, [], true);
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::integer AS attempt_count
       FROM assessment_attempts
       WHERE assessment_id = $1 AND learner_id = $2`,
      [id, learnerId]
    );
    if (assessment.max_attempts !== null && countResult.rows[0].attempt_count >= assessment.max_attempts) {
      return { maximumAttemptsReached: true };
    }

    const sourceQuestions = await client.query(
      `SELECT questions.id, questions.skill_id, questions.prompt,
              questions.question_type, assessment_questions.max_points,
              question_options.id AS option_id, question_options.option_text,
              question_options.is_correct, question_options.position
       FROM assessment_questions
       JOIN questions ON questions.id = assessment_questions.question_id
       JOIN question_options ON question_options.question_id = questions.id
       WHERE assessment_questions.assessment_id = $1
         AND questions.status = 'active'
       ORDER BY questions.id, question_options.position`,
      [id]
    );
    const questionsById = new Map();
    for (const row of sourceQuestions.rows) {
      const key = String(row.id);
      const question = questionsById.get(key) ?? {
        id: key,
        skillId: String(row.skill_id),
        prompt: row.prompt,
        questionType: row.question_type,
        maxPoints: Number(row.max_points),
        options: []
      };
      question.options.push({
        id: String(row.option_id),
        text: row.option_text,
        isCorrect: row.is_correct
      });
      questionsById.set(key, question);
    }
    const questions = [...questionsById.values()];
    if (questions.length !== assessment.question_count) {
      throw createError(409, "Assessment question pool is incomplete");
    }

    for (const question of questions) {
      if (question.options.length !== 4 || question.options.filter((option) => option.isCorrect).length !== 1) {
        throw createError(409, "Assessment contains a question with invalid answer options");
      }
    }

    const maxPoints = questions.reduce((total, question) => total + question.maxPoints, 0);
    if (maxPoints <= 0) {
      throw createError(409, "Assessment has no gradable questions");
    }
    const attemptCount = countResult.rows[0].attempt_count;
    const attemptResult = await client.query(
      `INSERT INTO assessment_attempts (
         assessment_id, learner_id, enrollment_id, attempt_number, status,
         started_at, expires_at, max_points, passing_percent_snapshot,
         grading_rubric_snapshot
       ) VALUES (
         $1, $2, $3, $4, 'in_progress', NOW(),
         NOW() + ($5 * INTERVAL '1 second'), $6, $7, NULL
       )
       RETURNING id, assessment_id, attempt_number, status, started_at, expires_at`,
      [
        id,
        learnerId,
        enrollmentId,
        attemptCount + 1,
        assessment.time_limit_seconds,
        maxPoints,
        assessment.passing_percent
      ]
    );
    const attempt = attemptResult.rows[0];

    for (const [index, question] of questions.entries()) {
      const answerKey = question.options.find((option) => option.isCorrect);
      const snapshot = {
        prompt: question.prompt,
        question_type: question.questionType,
        options: question.options.map(({ id: optionId, text }) => ({
          id: optionId,
          text
        }))
      };
      await client.query(
        `INSERT INTO attempt_questions (
           attempt_id, question_id, skill_id, position, question_snapshot,
           answer_key_snapshot, max_points
         ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)`,
        [
          attempt.id,
          question.id,
          question.skillId,
          index + 1,
          JSON.stringify(snapshot),
          JSON.stringify({
            correct_option_id: answerKey.id,
            correct_option_text: answerKey.text
          }),
          question.maxPoints
        ]
      );
    }

    return {
      ...attempt,
      title: assessment.title,
      questions: await getAttemptQuestions(client, attempt.id)
    };
  });

  if (attempt.maximumAttemptsReached) {
    throw createError(409, "Maximum number of attempts reached");
  }
  return attempt;
}

async function persistAnswers(client, attemptId, answers) {
  const validatedAnswers = validateAnswers(answers);
  if (validatedAnswers.length === 0) {
    return;
  }

  const attemptQuestions = await client.query(
    `SELECT id, question_snapshot
     FROM attempt_questions
     WHERE attempt_id = $1`,
    [attemptId]
  );
  const questionsById = new Map(
    attemptQuestions.rows.map((question) => [String(question.id), readJson(question.question_snapshot)])
  );

  for (const answer of validatedAnswers) {
    const snapshot = questionsById.get(answer.attemptQuestionId);
    if (!snapshot) {
      throw createError(400, "An answer references a question outside this attempt");
    }
    if (!snapshot.options.some((option) => String(option.id) === answer.selectedOptionId)) {
      throw createError(400, "An answer references an option outside its question");
    }

    await client.query(
      `INSERT INTO attempt_answers (
         attempt_question_id, answer_payload, awarded_points, feedback, answered_at
       ) VALUES ($1, $2::jsonb, NULL, NULL, NOW())
       ON CONFLICT (attempt_question_id)
       DO UPDATE SET answer_payload = EXCLUDED.answer_payload,
                     awarded_points = NULL,
                     feedback = NULL,
                     answered_at = NOW(),
                     graded_by = NULL,
                     graded_at = NULL`,
      [answer.attemptQuestionId, JSON.stringify({ selected_option_id: answer.selectedOptionId })]
    );
  }
}

async function updateCourseProgress(client, attempt) {
  if (!attempt.enrollment_id || !attempt.lesson_id) {
    return;
  }

  const lessonResult = await client.query(
    `SELECT lessons.id, lessons.is_required, chapters.course_id
     FROM lessons
     JOIN chapters ON chapters.id = lessons.chapter_id
     WHERE lessons.id = $1`,
    [attempt.lesson_id]
  );
  if (lessonResult.rowCount === 0) {
    return;
  }
  const lesson = lessonResult.rows[0];

  const completionResult = await client.query(
    `SELECT
       NOT EXISTS (
         SELECT 1
         FROM videos
         LEFT JOIN video_progress
           ON video_progress.video_id = videos.id
          AND video_progress.enrollment_id = $1
         WHERE videos.lesson_id = $2
           AND video_progress.completed_at IS NULL
       ) AS videos_complete,
       NOT EXISTS (
         SELECT 1
         FROM lesson_materials
         LEFT JOIN material_progress
           ON material_progress.material_id = lesson_materials.id
          AND material_progress.enrollment_id = $1
         WHERE lesson_materials.lesson_id = $2
           AND lesson_materials.is_required = TRUE
           AND material_progress.completed_at IS NULL
       ) AS materials_complete,
       NOT EXISTS (
         SELECT 1
         FROM assessments
         WHERE assessments.lesson_id = $2
           AND assessments.is_required = TRUE
           AND assessments.status = 'published'
           AND NOT EXISTS (
             SELECT 1
             FROM assessment_attempts
             WHERE assessment_attempts.assessment_id = assessments.id
               AND assessment_attempts.enrollment_id = $1
               AND assessment_attempts.learner_id = $3
               AND assessment_attempts.status = 'graded'
               AND assessment_attempts.is_passed = TRUE
           )
       ) AS assessments_complete`,
    [attempt.enrollment_id, attempt.lesson_id, attempt.learner_id]
  );
  const { videos_complete: videosComplete, materials_complete: materialsComplete, assessments_complete: assessmentsComplete } =
    completionResult.rows[0];
  const isLessonComplete = videosComplete && materialsComplete && assessmentsComplete;

  await client.query(
    `INSERT INTO lesson_progress (
       enrollment_id, lesson_id, status, started_at, last_accessed_at, completed_at
     ) VALUES (
       $1, $2, $3, NOW(), NOW(), CASE WHEN $4 THEN NOW() ELSE NULL END
     )
     ON CONFLICT (enrollment_id, lesson_id)
     DO UPDATE SET
       status = CASE
         WHEN lesson_progress.status = 'completed' OR EXCLUDED.status = 'completed' THEN 'completed'
         ELSE 'in_progress'
       END,
       last_accessed_at = NOW(),
       completed_at = CASE
         WHEN lesson_progress.status = 'completed' THEN lesson_progress.completed_at
         WHEN EXCLUDED.status = 'completed' THEN NOW()
         ELSE NULL
       END`,
    [
      attempt.enrollment_id,
      attempt.lesson_id,
      isLessonComplete ? "completed" : "in_progress",
      isLessonComplete
    ]
  );

  if (!lesson.is_required) {
    return;
  }

  await client.query(
    `UPDATE enrollments
     SET status = 'completed', completed_at = COALESCE(completed_at, NOW())
     WHERE id = $1
       AND status = 'active'
       AND NOT EXISTS (
         SELECT 1
         FROM lessons
         JOIN chapters ON chapters.id = lessons.chapter_id
         WHERE chapters.course_id = $2
           AND lessons.is_required = TRUE
           AND NOT EXISTS (
             SELECT 1
             FROM lesson_progress
             WHERE lesson_progress.enrollment_id = enrollments.id
               AND lesson_progress.lesson_id = lessons.id
               AND lesson_progress.status = 'completed'
           )
       )`,
    [attempt.enrollment_id, lesson.course_id]
  );
}

async function finalizeAttempt(client, attemptId, learnerId, answers = [], isTimeout = false) {
  const attemptResult = await client.query(
    `SELECT assessment_attempts.*, assessments.lesson_id
     FROM assessment_attempts
     JOIN assessments ON assessments.id = assessment_attempts.assessment_id
     WHERE assessment_attempts.id = $1
       AND assessment_attempts.learner_id = $2
     FOR UPDATE OF assessment_attempts`,
    [attemptId, learnerId]
  );
  if (attemptResult.rowCount === 0) {
    throw createError(404, "Assessment attempt not found");
  }
  const attempt = attemptResult.rows[0];
  if (attempt.status !== "in_progress") {
    throw createError(409, "This assessment attempt has already been submitted");
  }
  const timedOut = isTimeout || (await client.query(
    `SELECT expires_at <= NOW() AS is_expired
     FROM assessment_attempts
     WHERE id = $1`,
    [attemptId]
  )).rows[0].is_expired;

  if (!timedOut) {
    await persistAnswers(client, attemptId, answers);
  }

  const questionsResult = await client.query(
    `SELECT attempt_questions.id, attempt_questions.answer_key_snapshot,
            attempt_questions.max_points, attempt_answers.answer_payload
     FROM attempt_questions
     LEFT JOIN attempt_answers ON attempt_answers.attempt_question_id = attempt_questions.id
     WHERE attempt_questions.attempt_id = $1
     ORDER BY attempt_questions.position`,
    [attemptId]
  );
  const answerMap = new Map(
    questionsResult.rows
      .filter((question) => question.answer_payload)
      .map((question) => [
        String(question.id),
        readJson(question.answer_payload)
      ])
  );
  const grade = gradeAttempt(questionsResult.rows, answerMap, attempt.passing_percent_snapshot);

  for (const question of grade.questions) {
    await client.query(
      `INSERT INTO attempt_answers (
         attempt_question_id, answer_payload, awarded_points, feedback, answered_at,
         graded_at
       ) VALUES ($1, $2::jsonb, $3, NULL, NOW(), NOW())
       ON CONFLICT (attempt_question_id)
       DO UPDATE SET awarded_points = EXCLUDED.awarded_points,
                     graded_at = NOW()`,
      [
        question.id,
        JSON.stringify({ selected_option_id: question.selectedOptionId }),
        question.awardedPoints
      ]
    );
  }

  await client.query(
    `UPDATE assessment_attempts
     SET status = 'graded',
         submitted_at = NOW(),
         submission_reason = $2,
         score = $3,
         is_passed = $4,
         graded_at = NOW()
     WHERE id = $1`,
    [attemptId, timedOut ? "timeout" : "manual", grade.score, grade.isPassed]
  );

  await updateCourseProgress(client, {
    ...attempt,
    learner_id: learnerId
  });

  return { ...attempt, ...grade, status: "graded", submission_reason: timedOut ? "timeout" : "manual" };
}

async function saveAttemptAnswers(attemptId, learnerId, answers) {
  const id = positiveId(attemptId, "attemptId");
  if (!Array.isArray(answers)) {
    throw createError(400, "answers must be an array");
  }

  return withTransaction(async (client) => {
    const result = await client.query(
      `SELECT id, status, (expires_at <= NOW()) AS is_expired
       FROM assessment_attempts
       WHERE id = $1 AND learner_id = $2
       FOR UPDATE`,
      [id, learnerId]
    );
    if (result.rowCount === 0) {
      throw createError(404, "Assessment attempt not found");
    }
    if (result.rows[0].status !== "in_progress") {
      throw createError(409, "This assessment attempt is no longer in progress");
    }
    if (result.rows[0].is_expired) {
      throw createError(410, "The assessment time limit has expired");
    }

    await persistAnswers(client, id, answers);
    return { attempt_id: id, saved_count: validateAnswers(answers).length };
  });
}

async function submitAttempt(attemptId, learnerId, answers = []) {
  const id = positiveId(attemptId, "attemptId");
  if (!Array.isArray(answers)) {
    throw createError(400, "answers must be an array");
  }

  return withTransaction(async (client) => finalizeAttempt(client, id, learnerId, answers));
}

async function getAttemptResult(attemptId, learnerId) {
  const id = positiveId(attemptId, "attemptId");
  const attemptResult = await pool.query(
    `SELECT assessment_attempts.id, assessment_attempts.assessment_id,
            assessment_attempts.attempt_number, assessment_attempts.status,
            assessment_attempts.started_at, assessment_attempts.submitted_at,
            assessment_attempts.score, assessment_attempts.max_points,
            assessment_attempts.is_passed, assessment_attempts.submission_reason,
            assessments.title, assessments.passing_percent
     FROM assessment_attempts
     JOIN assessments ON assessments.id = assessment_attempts.assessment_id
     WHERE assessment_attempts.id = $1
       AND assessment_attempts.learner_id = $2`,
    [id, learnerId]
  );
  if (attemptResult.rowCount === 0) {
    throw createError(404, "Assessment attempt not found");
  }
  const attempt = attemptResult.rows[0];
  if (!["submitted", "graded"].includes(attempt.status)) {
    throw createError(409, "Results are available after the assessment is submitted");
  }

  const questionsResult = await pool.query(
    `SELECT attempt_questions.position, attempt_questions.question_snapshot,
            attempt_questions.answer_key_snapshot, attempt_questions.max_points,
            attempt_answers.answer_payload, attempt_answers.awarded_points
     FROM attempt_questions
     LEFT JOIN attempt_answers ON attempt_answers.attempt_question_id = attempt_questions.id
     WHERE attempt_questions.attempt_id = $1
     ORDER BY attempt_questions.position`,
    [id]
  );
  const questions = questionsResult.rows.map((row) => {
    const snapshot = readJson(row.question_snapshot);
    const answerKey = readJson(row.answer_key_snapshot);
    const answer = row.answer_payload ? readJson(row.answer_payload) : null;
    const selectedId = answer?.selected_option_id ? String(answer.selected_option_id) : null;
    const correctId = String(answerKey.correct_option_id);
    return {
      position: row.position,
      prompt: snapshot.prompt,
      options: snapshot.options.map((option) => ({
        ...option,
        is_correct: String(option.id) === correctId,
        is_selected: String(option.id) === selectedId
      })),
      selected_option_id: selectedId,
      correct_option_id: correctId,
      correct_option_text: answerKey.correct_option_text,
      is_correct: selectedId === correctId,
      awarded_points: row.awarded_points,
      max_points: row.max_points
    };
  });

  return { ...attempt, questions };
}

async function listAttemptHistory(learnerId) {
  const result = await pool.query(
    `SELECT assessment_attempts.id, assessment_attempts.assessment_id,
            assessment_attempts.attempt_number, assessment_attempts.status,
            assessment_attempts.started_at, assessment_attempts.submitted_at,
            assessment_attempts.score, assessment_attempts.max_points,
            assessment_attempts.is_passed, assessments.title,
            courses.title AS course_title, lessons.title AS lesson_title
     FROM assessment_attempts
     JOIN assessments ON assessments.id = assessment_attempts.assessment_id
     LEFT JOIN courses ON courses.id = assessments.course_id
     LEFT JOIN lessons ON lessons.id = assessments.lesson_id
     WHERE assessment_attempts.learner_id = $1
     ORDER BY assessment_attempts.started_at DESC`,
    [learnerId]
  );
  return result.rows;
}

module.exports = {
  getAuthoringData,
  createAssessment,
  listAvailableAssessments,
  startAttempt,
  getAttemptForLearner,
  saveAttemptAnswers,
  submitAttempt,
  getAttemptResult,
  listAttemptHistory
};
