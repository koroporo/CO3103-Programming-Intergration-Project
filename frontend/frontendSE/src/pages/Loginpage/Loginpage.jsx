import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import './Button.css';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <form className="login-form">

        <button 
          type="button" 
          className="btn-back" 
          onClick={() => navigate("/")}
        >
          {/* Icon mũi tên quay lại */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>

        <h1 className="title-red">Sign In</h1>
        <p className="subtitle">Sign in to continue studying and pick up where you left off.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type="password"
            placeholder="********"
            required
          />
          <span className="eye-icon">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </span>
        </div>

        <button 
          className="btn-signin" 
          type="submit" 
          onClick={() => navigate("/")}
        >
          Sign In
        </button>

        <div className="divider">
          <span>OR CONTINUE WITH</span>
        </div>




        <button type="button" className="btn-google">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
            alt="Google logo" 
            style={{ width: '18px', height: '18px' }} 
          />
          Continue with Google
        </button>

        <p className="footer-text">
          First time you are here? <span className="link-create" onClick={() => navigate("/signup")}>Create an account</span>
        </p>

      </form>
    </div>
  );
}