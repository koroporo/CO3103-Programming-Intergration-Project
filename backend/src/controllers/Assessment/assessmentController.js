
const pool = require("../../db");

async function submitAssessment(req, res) {
  const { assessmentId, answers } = req.body;
  const learnerId = req.user.id;

  // Validate the request body.
  if (
    !Number.isInteger(Number(assessmentId)) ||
    !Array.isArray(answers) ||
    answers.length === 0
  ) {
    return res.status(400).json({
      message: "assessmentId and at least one answer are required",
    });
  }

  const normalizedAnswers = answers.map((answer) => ({
    questionId: Number(answer.questionId),
    text: typeof answer.text === "string" ? answer.text.trim() : "",
  }));

  if (
    normalizedAnswers.some(
      (answer) =>
        !Number.isInteger(answer.questionId) || answer.text.length === 0,
    )
  ) {
    return res.status(400).json({
      message: "Every answer must include a valid questionId and non-empty text",
    });
  }

  // Reject duplicate question IDs in the same request.
  const questionIds = normalizedAnswers.map((answer) => answer.questionId);

  if (new Set(questionIds).size !== questionIds.length) {
    return res.status(400).json({
      message: "Duplicate question IDs are not allowed",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the assessment while checking its rules and attempt limit.
    const assessmentResult = await client.query(
      `SELECT
         id,
         purpose,
         status,
         due_at,
         opens_at,
         time_limit_seconds,
         max_attempts,
         passing_percent,
         grading_rubric,
         assigned_learner_id
       FROM assessments
       WHERE id = $1
       FOR UPDATE`,
      [Number(assessmentId)],
    );

    if (assessmentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Assignment not found" });
    }

    const assessment = assessmentResult.rows[0];

    if (
      assessment.purpose !== "assignment" ||
      assessment.status !== "published"
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "This assignment is not available for submission",
      });
    }

    if (
      assessment.assigned_learner_id !== null &&
      String(assessment.assigned_learner_id) !== String(learnerId)
    ) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "You are not allowed to submit this assignment",
      });
    }

    const nowResult = await client.query(
      `SELECT NOW() AS now`,
    );
    const now = nowResult.rows[0].now;

    if (assessment.opens_at && now < assessment.opens_at) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "This assignment is not open yet",
      });
    }

    if (assessment.due_at && now > assessment.due_at) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "The assignment deadline has passed",
      });
    }

    // Count this learner's previous attempts.
    const attemptsResult = await client.query(
      `SELECT
         COUNT(*)::int AS attempt_count,
         COALESCE(
           BOOL_OR(status = 'in_progress'),
           FALSE
         ) AS has_in_progress
       FROM assessment_attempts
       WHERE assessment_id = $1
         AND learner_id = $2`,
      [assessment.id, learnerId],
    );

    const { attempt_count, has_in_progress } = attemptsResult.rows[0];

    if (has_in_progress) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message:
          "You already have an in-progress attempt. This endpoint currently supports one-click submission only.",
      });
    }

    if (
      assessment.max_attempts !== null &&
      attempt_count >= assessment.max_attempts
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "You have reached the maximum number of attempts",
      });
    }

    // Load the active essay questions belonging to this assignment.
    const questionsResult = await client.query(
      `SELECT
         q.id AS question_id,
         q.skill_id,
         q.question_type,
         q.prompt,
         q.media_url,
         q.answer_key,
         aq.max_points,
         aq.is_required,
         aq.assessment_id
       FROM assessment_questions aq
       JOIN questions q ON q.id = aq.question_id
       WHERE aq.assessment_id = $1
         AND q.status = 'active'
         AND q.question_type = 'essay'
       ORDER BY q.id`,
      [assessment.id],
    );

    const questions = questionsResult.rows;

    if (questions.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "This assignment has no active essay questions",
      });
    }

    const questionMap = new Map(
      questions.map((question) => [
        String(question.question_id),
        question,
      ]),
    );

    // Every submitted question must belong to this assignment.
    for (const answer of normalizedAnswers) {
      if (!questionMap.has(String(answer.questionId))) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Question ${answer.questionId} does not belong to this assignment`,
        });
      }
    }

    // Require answers for all required questions.
    const submittedIds = new Set(
      normalizedAnswers.map((answer) => String(answer.questionId)),
    );

    const missingRequired = questions.some(
      (question) =>
        question.is_required &&
        !submittedIds.has(String(question.question_id)),
    );

    if (missingRequired) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Please answer every required question",
      });
    }

    const totalPoints = questions.reduce(
      (sum, question) => sum + Number(question.max_points),
      0,
    );

    if (totalPoints <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "The assignment has an invalid point configuration",
      });
    }

    // Required by the schema. Use the earlier of the time limit
    // and assignment deadline. Infinity means no expiry was configured.
    const expiryResult = await client.query(
      `SELECT LEAST(
         COALESCE(
           CASE
             WHEN $1::integer IS NOT NULL
             THEN NOW() + ($1::integer * INTERVAL '1 second')
           END,
           'infinity'::timestamptz
         ),
         COALESCE($2::timestamptz, 'infinity'::timestamptz)
       ) AS expires_at`,
      [assessment.time_limit_seconds, assessment.due_at],
    );

    const expiresAt = expiryResult.rows[0].expires_at;

    // The submission happens immediately, so the attempt is finalized
    // as awaiting_grading rather than remaining in_progress.
    const attemptResult = await client.query(
      `INSERT INTO assessment_attempts (
         assessment_id,
         learner_id,
         attempt_number,
         status,
         started_at,
         expires_at,
         submitted_at,
         submission_reason,
         max_points,
         passing_percent_snapshot,
         grading_rubric_snapshot
       )
       VALUES (
         $1, $2, $3, 'awaiting_grading',
         NOW(), $4, NOW(), 'manual',
         $5, $6, $7
       )
       RETURNING id, status, submitted_at`,
      [
        assessment.id,
        learnerId,
        attempt_count + 1,
        expiresAt,
        totalPoints,
        assessment.passing_percent,
        assessment.grading_rubric,
      ],
    );

    const attempt = attemptResult.rows[0];

    // Create immutable question snapshots and save each supplied answer.
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      const attemptQuestionResult = await client.query(
        `INSERT INTO attempt_questions (
           attempt_id,
           question_id,
           skill_id,
           position,
           question_snapshot,
           answer_key_snapshot,
           max_points
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          attempt.id,
          question.question_id,
          question.skill_id,
          index + 1,
          JSON.stringify({
            type: question.question_type,
            prompt: question.prompt,
            mediaUrl: question.media_url,
          }),
          JSON.stringify(question.answer_key ?? {}),
          question.max_points,
        ],
      );

      const suppliedAnswer = normalizedAnswers.find(
        (answer) =>
          answer.questionId === Number(question.question_id),
      );

      if (suppliedAnswer) {
        await client.query(
          `INSERT INTO attempt_answers (
             attempt_question_id,
             answer_payload,
             answered_at
           )
           VALUES ($1, $2, NOW())`,
          [
            attemptQuestionResult.rows[0].id,
            JSON.stringify({ text: suppliedAnswer.text }),
          ],
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Assignment submitted successfully",
      data: {
        attemptId: attempt.id,
        status: attempt.status,
        submittedAt: attempt.submitted_at,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to submit assignment:", error);

    return res.status(500).json({
      message: "Failed to submit assignment",
    });
  } finally {
    client.release();
  }
}

module.exports = {
  submitAssessment,
};
