import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileButton() {
    const [isOpen, setIsOpen] = useState(false);

    // Temporary data — later get this from login/authentication
    const user = {
        name: "Phuc",
        role: "admin"
    };
    const navigate = useNavigate();
    function handleMyAccount()
    {
        navigate("/my-account");
    }
    function handleHistory()
    {
        navigate("/history");
    }
    function handleNotifications()
    {
        navigate("/notifications");
    }
    function handleAdmin()
    {
        navigate("/admin-board");
    }



    return (
        <div className="profile-container">

            <button
                className="profile-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                👤 User Profile
            </button>

            {isOpen && (
                <div className="profile-menu">

                    <div className="profile-info">
                        <strong>{user.name}</strong> <br></br>
                        Role: <span>{user.role}</span>
                    </div>

                    <button onClick={handleMyAccount}>My Account</button>
                    <button onClick={handleHistory}>History</button>
                    <button onClick={handleNotifications}>Notifications</button>

                    {user.role === "admin" && (
                        <button onClick={handleAdmin}>Admin Dashboard</button>
                    )}

                    {user.role === "instructor" && (
                        <button>Instructor Dashboard</button>
                    )}

                    <button>Logout</button>

                </div>
            )}

        </div>
    );
}