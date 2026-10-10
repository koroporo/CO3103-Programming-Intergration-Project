import { useNavigate } from 'react-router-dom';
import './Signuppage.css';

export default function Signuppage() {
  const navigate = useNavigate();

  return (
    <div className="signup-page">
      <form className="signup-form">
        
        {/* Nút Back */}
        <button 
          type="button" 
          className="btn-back" 
          onClick={() => navigate(-1)} // Hoặc navigate("/") tùy router của bạn
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>

        {/* Tiêu đề */}
        <div className="signup-header">
          <h1>Sign Up</h1>
          <p>Create an account to start learning</p>
        </div>

        {/* Khung nhập Email có nút Verify */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="email-wrapper">
            <input id="email" type="email" placeholder="Enter your email" required />
            <button type="button" className="btn-verify">Verify</button>
          </div>
        </div>

        {/* Hai khung nhập First Name và Last Name nằm ngang */}
        <div className="name-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input id="firstName" type="text" placeholder="First name" required />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input id="lastName" type="text" placeholder="Last name" required />
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Create a password" required />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" placeholder="Confirm password" required />
        </div>

        {/* Nút Sign Up chính giữa */}
        <div className="submit-row">
          <button type="submit" className="btn-signup-submit">Sign Up</button>
        </div>

        {/* Dòng chữ dưới cùng */}
        <p className="signup-footer">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>

      </form>
    </div>
  );
}