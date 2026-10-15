import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profilebutton.css"; // Hãy chắc chắn đã import file css này
import myAvatar from "../../assets/avt.jpg";

export default function ProfileButton() {
    const [isOpen, setIsOpen] = useState(false);

    // Temporary data — sau này lấy từ login/authentication
    const user = {
        name: "Phuc",
        role: "instructor",
        status: "Online",
        // Bạn có thể thêm link ảnh avatar ở đây, nếu không có sẽ dùng ảnh mặc định
        avatar: myAvatar // Ví dụ ảnh tạm thời, hoặc ảnh của bạn
    };
    
    const navigate = useNavigate();

    function handleMyAccount() {
        navigate("/my-account");
        setIsOpen(false);
    }
    function handleHistory() {
        navigate("/history");
        setIsOpen(false);
    }
    function handleNotifications() {
        navigate("/notifications");
        setIsOpen(false);
    }
    function handleAdmin() {
        navigate("/admin-board");
        setIsOpen(false);
    }
    function applyInstructor() {
        navigate("/apply-instructor");
        setIsOpen(false);
    }
    function handleInstructor()
    {
        navigate("/instructor-studio");
        setIsOpen(false);
    }

    return (
        <div className="profile-container">
            {/* Nút profile hình tròn kèm mũi tên */}
            <button
                className="profile-button-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* 3. Đưa biến user.avatar vào thẻ img */}
                <img 
                    src={user.avatar} 
                    alt="User Avatar" 
                    className="profile-avatar"
                />
                <span className="arrow-down">▼</span>
            </button>

            {isOpen && (
                <div className="profile-menu">
                    <div className="profile-info">
                        <strong>{user.name}</strong>
                        <div className="profile-meta">
                            <span>Role: {user.role}</span>
                            <span>Status: <span className="status-online">{user.status}</span></span>
                        </div>
                    </div>
                    
                    <hr className="menu-divider" />

                    <div className="menu-links">
                        <button onClick={handleMyAccount}>My Account</button>
                        <button onClick={handleHistory}>History</button>
                        <button onClick={handleNotifications}>Notifications</button>
                        
                        {user.role === "learner" && (
                            <button onClick={applyInstructor}>Apply to be instructor</button>
                        )}

                        {user.role === "admin" && (
                            <button onClick={handleAdmin}>Admin Dashboard</button>
                        )}

                        {user.role === "instructor" && (
                            <button onClick={handleInstructor}>Instructor Studio</button>
                        )}

                        <hr className="menu-divider" />
                        <button className="logout-btn">Logout</button>
                    </div>
                </div>
            )}
        </div>
    );
}