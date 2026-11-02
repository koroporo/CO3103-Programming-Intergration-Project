
import { useState } from "react";
import { sendResetRequest } from "../../services/authServices/reset";
import "./ForgotPassword.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setIsLoading(true);

      const data = await sendResetRequest(email.trim());

      setMessage(data.message || "Reset request sent successfully.");

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }


return (
    <div className="forgot-password-page">
        <form className="forgot-password-form" onSubmit={handleReset}>
            <h1>Forgot Password</h1>
            <p className="subtitle">
                Enter your email to receive a password reset link.
            </p>

            <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(event) => setEmail(event.target.value)}
                required
            />

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Reset password"}
            </button>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </form>
    </div>
);

}
