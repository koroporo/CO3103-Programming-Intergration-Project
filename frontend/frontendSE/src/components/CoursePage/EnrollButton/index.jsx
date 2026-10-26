
import { useState } from "react";
// import { useEnrollStatus } from "./useEnrollStatus";
import CancelCourseModal from "./CancelCourseModal";
import "./EnrollButton.css";

export default function EnrollButton({ courseId, enrollment }) {
  const {
    status,
    enrollmentStatus,
    error,
    enroll,
    cancelCourse,
  } = enrollment;

  const [showCancelModal, setShowCancelModal] = useState(false);

  if (status === "checking") {
    return <p>Checking enrollment...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Please log in to enroll in this course.</p>;
  }

  if (status === "error") {
    return <p role="alert">{error}</p>;
  }

  if (status === "loading") {
    return <button disabled>Processing...</button>;
  }

  if (status === "enrolled") {
    return (
      <div className="enroll-actions">
        <button
          type="button"
          className="enroll-btn enroll-btn--enrolled"
          disabled
        >
          {enrollmentStatus === "completed" ? "Course Completed" : "Enrolled"}
        </button>

        {enrollmentStatus === "active" && (
          <button
            type="button"
            className="enroll-btn enroll-btn--cancel"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Course
          </button>
        )}

        {showCancelModal && (
          <CancelCourseModal
            onClose={() => setShowCancelModal(false)}
            onConfirm={async () => {
              setShowCancelModal(false);
              await cancelCourse();
            }}
          />
        )}

        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="enroll-actions">
      <button
        type="button"
        className="enroll-btn enroll-btn--primary"
        onClick={enroll}
      >
        Enroll Now
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
