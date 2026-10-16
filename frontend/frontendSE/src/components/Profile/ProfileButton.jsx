import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authServices/logout";
import { useAuth } from "../../hooks/Authentication/useAuth";
import myAvatar from "../../assets/avt.jpg";
import "./profilebutton.css";

export default function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const name = user?.full_name || "User";
  const role = user?.role || "Unknown";

  function handleMyAccount() {
    setIsOpen(false);
    navigate("/my-account");
  }

  function handleHistory() {
    setIsOpen(false);
    navigate("/history");
  }

  function handleNotifications() {
    setIsOpen(false);
    navigate("/notifications");
  }

  function handleAdmin() {
    setIsOpen(false);
    navigate("/admin-board");
  }

  function applyInstructor() {
    setIsOpen(false);
    navigate("/apply-instructor");
  }

  async function handleLogout() {
    try {
      await logout();
      logoutUser();
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Avoid rendering the profile menu for an unauthenticated user.
  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <button
        className="profile-button-trigger"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Profile menu for ${name}, role ${role}`}
      >
        <img
          src={myAvatar}
          alt="User Avatar"
          className="profile-avatar"
        />
        <span className="arrow-down">▼</span>
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-info">
            <strong>{name}</strong>

            <div className="profile-meta">
              <span>Role: {role}</span>
            </div>
          </div>

          <hr className="menu-divider" />

          <div className="menu-links">
            <button onClick={handleMyAccount}>My Account</button>
            <button onClick={handleHistory}>History</button>
            <button onClick={handleNotifications}>Notifications</button>

            {role === "learner" && (
              <button onClick={applyInstructor}>
                Apply to be instructor
              </button>
            )}

            {role === "admin" && (
              <button onClick={handleAdmin}>
                Admin Dashboard
              </button>
            )}

            {role === "instructor" && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/instructor-dashboard");
                }}
              >
                Instructor Dashboard
              </button>
            )}

            <hr className="menu-divider" />

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
