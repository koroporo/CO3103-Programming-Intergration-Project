
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ResetPasswordPage.css"

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");

        if (!token) {
            setMessage("The reset link is invalid or missing its token.");
            return;
        }

        if (password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(
                "http://localhost:3000/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Unable to reset password."
                );
            }

            setMessage("Password reset successfully. Redirecting to login...");

            setTimeout(() => {
                navigate("/login-page");
            }, 2000);
        } catch (error) {
            setMessage(error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }

   return (
    <div className="reset-password-page">
        <form className="reset-password-form" onSubmit={handleSubmit}>
            <h1>Reset Your Password</h1>
            <p className="subtitle">
                Enter and confirm your new password below.
            </p>

            <div className="form-group">
                <label htmlFor="password">New password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">
                    Confirm new password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    required
                />
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset password"}
            </button>

            {message && <p className="status-message" role="status">{message}</p>}
        </form>
    </div>
);
}
