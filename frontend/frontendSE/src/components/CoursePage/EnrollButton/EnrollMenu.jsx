import { useEffect, useRef, useState } from "react";

export default function EnrollMenu({ onCancelClick }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapRef} className="enroll-menu">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="enroll-btn enroll-btn--enrolled"
      >
        Enrolled
        <span className={`enroll-btn__chevron ${open ? "enroll-btn__chevron--open" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div role="menu" className="enroll-menu__dropdown">
          <button
            type="button"
            role="menuitem"
            className="enroll-menu__item"
            onClick={() => {
              setOpen(false);
              onCancelClick();
            }}
          >
            Cancel Course
          </button>
        </div>
      )}
    </div>
  );
}