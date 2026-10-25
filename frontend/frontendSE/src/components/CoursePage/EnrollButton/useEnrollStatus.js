import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/Authentication/useAuth";

export function useEnrollStatus({ courseId, isEnrolled, onEnroll, onCancelCourse }) {

  const [status, setStatus] = useState(TextTrackCueList ? "enrolled" : "idle");

  useEffect(() => {
    setStatus(isEnrolled ? "enrolled" : "idle");
  }, [isEnrolled]);

  const enroll = async () => {
    
    setStatus("loading");
    try {
      await onEnroll(courseId);
      setStatus("enrolled");
    } catch {
      setStatus("idle");
      // TODO: toast
    }
  };

  const cancelCourse = async () => {
    setStatus("loading");
    try {
      await onCancelCourse(courseId);
      setStatus("idle");
    } catch {
      setStatus("enrolled");
      // TODO: toast
    }
  };

  return { status, enroll, cancelCourse };
}