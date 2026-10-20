
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendResetRequest } from "../../services/authServices/reset";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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

      // Navigate only if the request succeeds.
      navigate("/reset-password", {
        state: { email: email.trim() },
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2>Forgot Password</h2>

      <form onSubmit={handleReset}>
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
      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
