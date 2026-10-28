import { useState } from "react";

export default function WritingAssignment({
  assessment,
  initialAnswer = "",
  submissionStatus = "",
  onSubmit,
}) {
  const [essay, setEssay] = useState(initialAnswer);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const wordCount = essay.trim()
    ? essay.trim().split(/\s+/).length
    : 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!essay.trim()) {
      setError("Please write your essay before submitting.");
      return;
    }

    if (!onSubmit) {
      setError("Submission is not connected to the backend yet.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await onSubmit({
        assessmentId: assessment.id,
        answer: essay,
      });

      setSuccess("Your essay has been submitted successfully.");
    } catch (err) {
      setError(err.message || "Failed to submit your essay.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="writing-assignment">
      <h2>{assessment.title}</h2>

      {assessment.instructions && (
        <p>{assessment.instructions}</p>
      )}

      {assessment.prompt && (
        <div className="writing-assignment__prompt">
          <h3>Writing task</h3>
          <p>{assessment.prompt}</p>
        </div>
      )}

      {assessment.dueAt && (
        <p>
          <strong>Due:</strong>{" "}
          {new Date(assessment.dueAt).toLocaleString()}
        </p>
      )}

      {submissionStatus && (
        <p>
          <strong>Submission status:</strong> {submissionStatus}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="writing-essay">
          Your essay
        </label>

        <textarea
          id="writing-essay"
          value={essay}
          onChange={(event) => setEssay(event.target.value)}
          placeholder="Write your IELTS essay here..."
          rows={14}
          disabled={submitting || submissionStatus === "submitted"}
        />

        <p className="writing-assignment__word-count">
          Word count: {wordCount}
        </p>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <button
          type="submit"
          disabled={
            submitting ||
            !essay.trim() ||
            submissionStatus === "submitted"
          }
        >
          {submitting ? "Submitting..." : "Submit essay"}
        </button>
      </form>
    </section>
  );
}