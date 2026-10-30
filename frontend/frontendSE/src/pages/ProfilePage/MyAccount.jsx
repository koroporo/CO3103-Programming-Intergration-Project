
import { useEffect, useState } from "react";
import "./MyAccount.css";
import myAvatar from "../../assets/avt.jpg";

export default function MyAccount() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getUser() {
            try {
                const response = await fetch(
                    "/api/auth/me",
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 401
                            ? "Please log in to view your account."
                            : "Failed to load account information."
                    );
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        getUser();
    }, []);

    if (loading) {
        return <div className="account-page-wrapper">Loading account...</div>;
    }

    if (error) {
        return <div className="account-page-wrapper">{error}</div>;
    }

    if (!user) {
        return <div className="account-page-wrapper">User information not found.</div>;
    }

    // Format the birthday returned by the API.
    const birthday = user.birthday
        ? new Date(user.birthday).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "UTC"
          })
        : "Not provided";

    const displayValue = (value) =>
        value !== null && value !== undefined && value !== ""
            ? value
            : "Not provided";

    return (
        <div className="account-page-wrapper">
            <div className="account-card">

                {/* ---------- LEFT COLUMN: AVATAR & STATUS ---------- */}
                <div className="account-sidebar">
                    <img
                        src={user.avatar_url || myAvatar}
                        alt="User Avatar"
                        className="large-avatar"
                    />

                    <button className="change-avatar-btn">
                        Change Avatar
                    </button>

                    <div className="status-container">
                        <span className="status-dot"></span>
                        <span className="status-text">
                            {user.status === "active" ? "Active" : displayValue(user.status)}
                        </span>
                    </div>
                </div>

                {/* ---------- RIGHT COLUMN: USER INFORMATION ---------- */}
                <div className="account-content">
                    <h1 className="account-header">My Account</h1>

                    <div className="info-grid">

                        {/* 1. Name */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">NAME</span>
                                <span className="info-value">
                                    {displayValue(user.full_name)}
                                </span>
                            </div>
                        </div>

                        {/* 2. Role */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">ROLE</span>
                                <span className="info-value role-badge">
                                    {displayValue(user.role)}
                                </span>
                            </div>
                        </div>

                        {/* 3. Phone Number */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                </svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">PHONE NUMBER</span>
                                <span className="info-value">
                                    {displayValue(user.phone_number)}
                                </span>
                            </div>
                        </div>

                        {/* 4. Sex */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="14" r="5"></circle>
                                    <line x1="13.54" y1="10.46" x2="21" y2="3"></line>
                                    <line x1="16" y1="3" x2="21" y2="3"></line>
                                    <line x1="21" y1="3" x2="21" y2="8"></line>
                                </svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">SEX</span>
                                <span className="info-value">
                                    {displayValue(user.sex)}
                                </span>
                            </div>
                        </div>

                        {/* 5. Birthday */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">BIRTHDAY</span>
                                <span className="info-value">{birthday}</span>
                            </div>
                        </div>

                        {/* 6. School */}
                        <div className="info-box school-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                                </svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">SCHOOL</span>
                                <span className="info-value">
                                    {displayValue(user.school)}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
