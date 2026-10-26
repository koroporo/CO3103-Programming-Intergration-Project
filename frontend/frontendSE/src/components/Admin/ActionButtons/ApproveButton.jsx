import './ActionButtons.css';  
import './ApproveButton.css';  

export default function ApproveButton({ onClick, ...rest }) {
  return (
    <button type="button" className="table-btn table-btn--approve" onClick={onClick} {...rest}>
      Approve
    </button>
  );
}