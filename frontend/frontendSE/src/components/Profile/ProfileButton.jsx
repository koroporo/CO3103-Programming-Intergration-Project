import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authServices/logout";
import { useAuth } from "../../hooks/Authentication/useAuth";

export default function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
    const { logoutUser } = useAuth();
  // Temporary data — later get this from login/authentication
  const user = {
    name: "Phuc",
    role: "admin",
    status: "Online",
  };
  const navigate = useNavigate();
  function handleMyAccount() {
    navigate("/my-account");
  }
  function handleHistory() {
    navigate("/history");
  }
  function handleNotifications() {
    navigate("/notifications");
  }
  function handleAdmin() {
    navigate("/admin-board");
  }
  function applyInstructor() {
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

  return (
    <div className="profile-container">
      <button className="profile-button" onClick={() => setIsOpen(!isOpen)}>
        👤 User Profile
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-info">
            <strong>{user.name}</strong> <br></br>
            Role: <span>{user.role}</span> <br></br>
            Status: <span>{user.status}</span>
          </div>

          <button onClick={handleMyAccount}>My Account</button>
          <button onClick={handleHistory}>History</button>
          <button onClick={handleNotifications}>Notifications</button>
          {user.role === "learner" && (
            <button onClick={applyInstructor}>Apply to be instructor</button>
          )}

          {user.role === "admin" && (
            <button onClick={handleAdmin}>Admin Dashboard</button>
          )}

          {user.role === "instructor" && <button>Instructor Dashboard</button>}

          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}
