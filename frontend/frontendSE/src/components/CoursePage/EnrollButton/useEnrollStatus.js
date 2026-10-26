
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

export function useEnrollStatus({ courseId }) {
  const [status, setStatus] = useState("checking");
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkEnrollment() {
      setStatus("checking");
      setEnrollmentId(null);
      setEnrollmentStatus(null);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/enrollment/get?limit=100&offset=0`,
          { credentials: "include" }
        );

        if (response.status === 401) {
          if (!cancelled) setStatus("unauthenticated");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not check enrollment status.");
        }

        const result = await response.json();
        const enrollments = result.data ?? [];

        const enrollment = enrollments.find(
          (item) => String(item.course_id) === String(courseId)
        );

        if (cancelled) return;

        if (
          enrollment &&
          ["active", "completed"].includes(enrollment.status)
        ) {
          setEnrollmentId(enrollment.id);
          setEnrollmentStatus(enrollment.status);
          setStatus("enrolled");
        } else {
          setStatus("idle");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
          setStatus("error");
        }
      }
    }

    if (courseId) checkEnrollment();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function enroll() {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(`${API_URL}/enrollment/post`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: String(courseId) }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Enrollment failed.");
      }

      setEnrollmentId(result.data.id);
      setEnrollmentStatus(result.data.status);

      setStatus(
        ["active", "completed"].includes(result.data.status)
          ? "enrolled"
          : "idle"
      );
    } catch (err) {
      setError(err.message || "Enrollment failed.");
      setStatus("idle");
    }
  }

  async function cancelCourse() {
    if (!enrollmentId) {
      setError("Enrollment ID is missing. Please refresh the page.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/enrollment/withdraw/${enrollmentId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not cancel this course.");
      }

      setEnrollmentId(null);
      setEnrollmentStatus("withdrawn");
      setStatus("idle");
    } catch (err) {
      setError(err.message || "Could not cancel this course.");

      // Keep the enrolled state if withdrawal fails.
      setStatus("enrolled");
    }
  }

  return {
    status,
    enrollmentId,
    enrollmentStatus,
    error,
    enroll,
    cancelCourse,
  };
}
