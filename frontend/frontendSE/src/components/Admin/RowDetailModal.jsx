import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './RowDetailModal.css';

const formatLabel = (key) =>
  key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

const renderValue = (key, value) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted">—</span>;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted">—</span>;
    return (
      <ul className="table-list-cell">
        {value.map((item, i) => (
          <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }

  const str = String(value);

  if (/status|role/i.test(key)) {
    return <span className={`badge badge--${str.toLowerCase()}`}>{str}</span>;
  }

  if (ISO_DATE.test(str)) {
    return str.replace('T', ' ').slice(0, 19);
  }

  return str;
};

export default function RowDetailModal({
  row,
  title = 'Chi tiết',
  exclude = [],
  onClose,
  children,
}) {
  useEffect(() => {
    if (!row) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [row, onClose]);

  if (!row) return null;

  const entries = Object.entries(row).filter(([key]) => !exclude.includes(key));

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <dl className="modal-fields">
          {entries.map(([key, value]) => (
            <div className="modal-field" key={key}>
              <dt>{formatLabel(key)}</dt>
              <dd>{renderValue(key, value)}</dd>
            </div>
          ))}
        </dl>

        {children && <div className="modal-footer">{children}</div>}
      </div>
    </div>,
    document.body
  );
}