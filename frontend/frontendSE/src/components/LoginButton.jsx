import { useNavigate } from 'react-router-dom';
import './LoginButton.css';

export default function LoginButton() {
  const navigate = useNavigate();

  return (
    <button
      className="login-button"
      type="button"
      onClick={() => navigate('/login')}
    >
      Log In
    </button>
  );
}