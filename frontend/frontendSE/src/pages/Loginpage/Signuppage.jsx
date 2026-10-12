import { useNavigate } from 'react-router-dom';
import './Signuppage.css';
import { useState } from 'react';
import { useAuth } from '../../hooks/Authentication/useAuth';
import { login } from '../../services/login';
import { register } from '../../services/register';


export default function Signuppage() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [message, setMessage] = useState("");
  const {loginUser} = useAuth();


async function handleSubmit(event) {
  // Prevent the browser from refreshing the page
  event.preventDefault();

  // Clear the previous message
  setMessage("");

  // Check whether the passwords match
  if (password !== secondPassword) {
    setMessage("Passwords do not match.");
    return;
  }

  try {
    // Step 1: Register the account
    await register(email, password, fullname);

    // Step 2: Log in using the new account
    const data = await login(email, password);

    // Step 3: Save the authenticated user in your frontend auth state
    loginUser(data.user);

    // Debugging
    console.log("Login response:", data);
    console.log("Token:", data.token);
    console.log("User:", data.user);

    // Step 4: Go to the customization page
    navigate("/customize");
  } catch (error) {
    console.error("Registration or login failed:", error);

    setMessage(
      error.message || "Registration or login failed. Please try again."
    );
  }
}


  return (
    <div className="signup-page">
      <form className="signup-form" onSubmit={handleSubmit}>
        
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
        {/* Hai khung nhập First Name và Last Name nằm ngang */}
        <div className="name-row">
          <div className="form-group">
            <label htmlFor="firstName">Full Name</label>
            <input id="firstName" type="text" placeholder="Full name" required onChange={(event)=>{setFullname(event.target.value)}} value={fullname} />
          </div>
          {/* skip phần này do mình chỉ làm full name thôi 
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input id="lastName" type="text" placeholder="Last name" required />
          </div> */}
        </div>


        {/* Khung nhập Email có nút Verify */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="email-wrapper">
            <input id="email" type="email" placeholder="Enter your email" required onChange={(event)=>{setEmail(event.target.value)}} value={email} />
            <button type="button" className="btn-verify">Verify</button>
          </div>
        </div>

        
        {/* Mật khẩu */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Create a password" required onChange={(event)=>{setPassword(event.target.value)}} value={password}/>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" placeholder="Confirm password" required onChange={(event)=>{setSecondPassword(event.target.value)}} value={secondPassword}/>
        </div>

        {/* Nút Sign Up chính giữa */}
        <div className="submit-row">
          <button type="submit" className="btn-signup-submit">Sign Up</button>
        </div>
            {message && (
        <p role="status" className='Message'>
          {message}
            </p>
              )}
        {/* Dòng chữ dưới cùng */}
        <p className="signup-footer">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>

      </form>
    </div>
  );
}