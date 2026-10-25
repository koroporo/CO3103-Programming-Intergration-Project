export default function CancelCourseModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-course-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="cancel-course-title" className="modal__title">
          Hủy khóa học?
        </h3>
        <p className="modal__text">
          Bạn sẽ mất quyền truy cập vào khóa học này.
        </p>
        <div className="modal__actions">
          <button type="button" onClick={onClose} className="modal__btn modal__btn--ghost">
            Quay lại
          </button>
          <button type="button" onClick={onConfirm} className="modal__btn modal__btn--danger">
            Cancel Course
          </button>
        </div>
      </div>
    </div>
  );
}