
import { useState } from "react";

export default function WritingAssignment({
  assessment,
  initialAnswer = "",
  submissionStatus = "",
  onSubmit,
}) {
  const [essay, setEssay] = useState(initialAnswer);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Support the field names returned by your backend.
  const assessmentId = assessment?.assessment_id ?? assessment?.id;
  const questionId = assessment?.question_id;
  const title =
    assessment?.assessment_title ?? assessment?.title ?? "Writing Assignment";
  const prompt = assessment?.prompt;
  const dueAt = assessment?.due_at ?? assessment?.dueAt;
  const instructions = assessment?.instructions;

  const isAlreadySubmitted =
    submitted ||
    ["submitted", "awaiting_grading", "graded"].includes(
      submissionStatus,
    );

  const wordCount = essay.trim()
    ? essay.trim().split(/\s+/).length
    : 0;

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!essay.trim()) {
      setError("Please write your essay before submitting.");
      return;
    }

    if (!assessmentId || !questionId) {
      setError("The assignment or question ID is missing.");
      return;
    }

    if (typeof onSubmit !== "function") {
      setError("The submission API has not been connected.");
      return;
    }

    try {
      setSubmitting(true);

      // Match the POST /assessment/submit API contract.
      await onSubmit({
        assessmentId,
        answers: [
          {
            questionId,
            text: essay.trim(),
          },
        ],
      });

      setSubmitted(true);
      setSuccess("Your essay has been submitted successfully.");
    } catch (err) {
      setError(err.message || "Failed to submit your essay.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="writing-assignment">
      <h2>{title}</h2>

      {instructions && <p>{instructions}</p>}

      {prompt && (
        <div className="writing-assignment__prompt">
          <h3>Writing task</h3>
          <p>{prompt}</p>
        </div>
      )}

      {dueAt && (
        <p>
          <strong>Due:</strong>{" "}
          {new Date(dueAt).toLocaleString()}
        </p>
      )}

      {assessment.max_points != null && (
        <p>
          <strong>Maximum points:</strong> {assessment.max_points}
        </p>
      )}

      {submissionStatus && (
        <p>
          <strong>Submission status:</strong> {submissionStatus}
        </p>
      )}

      {isAlreadySubmitted ? (
        <p role="status">
          This essay has already been submitted. You cannot submit it again.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor={`writing-essay-${assessmentId}`}>
            Your essay
          </label>

          <textarea
            id={`writing-essay-${assessmentId}`}
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            placeholder="Write your IELTS essay here..."
            rows={14}
            disabled={submitting}
          />

          <p className="writing-assignment__word-count">
            Word count: {wordCount}
          </p>

          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}

          <button
            type="submit"
            disabled={submitting || !essay.trim()}
          >
            {submitting ? "Submitting..." : "Submit essay"}
          </button>
        </form>
      )}
    </section>
  );
}
