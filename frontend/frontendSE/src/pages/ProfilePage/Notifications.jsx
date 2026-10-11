import React, { useState } from "react";
import "./Notifications.css";

export default function Notifications() {
    // Dữ liệu mẫu ban đầu về thông báo cho việc luyện IELTS
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "feedback", // feedback, reminder, achievement, system
            text: 'Bài viết "IELTS Writing Task 2 - Education & Technology" của bạn đã được chấm điểm! Xem nhận xét từ giáo viên ngay.',
            time: "10 mins ago",
            isUnread: true,
            color: "#a855f7", // Tím
            bg: "#f3e8ff"
        },
        {
            id: 2,
            type: "reminder",
            text: 'Nhắc nhở: Bạn có lịch hẹn kiểm tra "IELTS Reading Mock Test" vào ngày mai lúc 09:00. Hãy chuẩn bị nhé!',
            time: "2 hours ago",
            isUnread: true,
            color: "#f97316", // Cam
            bg: "#ffedd5"
        },
        {
            id: 3,
            type: "achievement",
            text: "Chúc mừng! Bạn đã hoàn thành bài thi 'IELTS Listening Practice - Section 3' với số điểm ấn tượng 6.5/9.0.",
            time: "Yesterday, 14:20",
            isUnread: true,
            color: "#10b981", // Xanh lá
            bg: "#d1fae5"
        },
        {
            id: 4,
            type: "system",
            text: "Khóa học 'IELTS Intensive Speaking' đã cập nhật thêm tài liệu mới cho Phần 2. Xem ngay!",
            time: "Oct 8, 2026",
            isUnread: true,
            color: "#3b82f6", // Xanh biển
            bg: "#dbeafe"
        }
    ]);

    const [activeFilter, setActiveFilter] = useState("All");

    // Đánh dấu toàn bộ đã đọc
    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(noti => ({ ...noti, isUnread: false })));
    };

    // Đánh dấu riêng lẻ từng cái khi nhấn vào
    const handleReadOne = (id) => {
        setNotifications(prev => 
            prev.map(noti => noti.id === id ? { ...noti, isUnread: false } : noti)
        );
    };

    // Lọc dữ liệu theo tab hoạt động
    const filteredNotis = notifications.filter(noti => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Unread") return noti.isUnread;
        if (activeFilter === "System") return noti.type === "system" || noti.type === "feedback";
        if (activeFilter === "Reminders") return noti.type === "reminder" || noti.type === "achievement";
        return true;
    });

    // Hàm xuất icon SVG tương ứng
    const renderIcon = (type, color) => {
        switch (type) {
            case "feedback": // Icon Bút
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>;
            case "reminder": // Icon Đồng hồ
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
            case "achievement": // Icon Cúp
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7z"></path></svg>;
            case "system": // Icon Chuông
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
            default:
                return null;
        }
    };

    return (
        <div className="noti-page-wrapper">
            <div className="noti-container">
                
                {/* Phần header phía trên cùng */}
                <div className="noti-header-section">
                    <div className="noti-header-left">
                        <h1>Notifications</h1>
                        <p>Stay updated with your IELTS learning progress, feedback, and reminders</p>
                    </div>
                    <button className="mark-all-btn" onClick={handleMarkAllRead}>
                        Mark all as read
                    </button>
                </div>

                {/* Các Tab bộ lọc */}
                <div className="noti-filters">
                    {["All", "Unread", "System", "Reminders"].map(tab => (
                        <button 
                            key={tab}
                            className={`filter-tab-btn ${activeFilter === tab ? "active" : ""}`}
                            onClick={() => setActiveFilter(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Danh sách các card thông báo */}
                <div className="noti-list">
                    {filteredNotis.map(noti => (
                        <div 
                            key={noti.id} 
                            className={`noti-card ${noti.isUnread ? "unread" : "read"}`}
                            onClick={() => handleReadOne(noti.id)}
                        >
                            {/* Icon bên trái */}
                            <div className="noti-icon" style={{ backgroundColor: noti.bg }}>
                                {renderIcon(noti.type, noti.color)}
                            </div>

                            {/* Nội dung text ở giữa */}
                            <div className="noti-content">
                                <p className="noti-text-desc">{noti.text}</p>
                                <span className="noti-time">{noti.time}</span>
                            </div>

                            {/* Chấm tròn báo chưa đọc ở góc phải */}
                            {noti.isUnread && (
                                <div className="unread-indicator"></div>
                            )}
                        </div>
                    ))}

                    {filteredNotis.length === 0 && (
                        <div className="empty-noti-state">
                            <p>Không có thông báo nào trong mục này.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}