import { useState } from "react";
import { useEnrollStatus } from "./useEnrollStatus";
import EnrollMenu from "./EnrollMenu";
import CancelCourseModal from "./CancelCourseModal";
import "./EnrollButton.css";

export default function EnrollButton(props) {
  const { status, enroll, cancelCourse } = useEnrollStatus(props);
  const [showCancelModal, setShowCancelModal] = useState(false);

 
    // return (
    //   <button
    //     type="button"
    //     onClick={enroll}
    //     disabled={status === "loading"}
    //     className="enroll-btn enroll-btn--primary"
    //   >
    //     {status === "loading" ? "Đang xử lý..." : "Enroll Now"}
    //   </button>
    // );
  

  return (
    <>
      <EnrollMenu onCancelClick={() => setShowCancelModal(true)} />

      {showCancelModal && (
        <CancelCourseModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={() => {
            setShowCancelModal(false);
            cancelCourse();
          }}
        />
      )}
    </>
  );
}