import './ActionButtons.css';  
import './RemoveButton.css'


export default function RemoveButton({ onClick, ...rest }) {
  return (
    <button type="button" className="table-btn table-btn--remove" onClick={onClick} {...rest}>
      Remove
    </button>
  );
}