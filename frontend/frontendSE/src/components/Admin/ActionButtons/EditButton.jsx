import './ActionButtons.css';  
import './EditButton.css'

export default function EditButton({ onClick, ...rest }) {
  return (
    <button type="button" className="table-btn table-btn--edit" onClick={onClick} {...rest}>
      Edit
    </button>
  );
}