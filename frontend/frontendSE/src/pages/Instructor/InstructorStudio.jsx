import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./InstructorStudio.css";
import ielts_1 from "../../assets/ielts_1.jpg"; 
import ielts_2 from "../../assets/ielts_2.jpg"; 
import ielts_3 from "../../assets/ielts_3.jpg"; 
export default function InstructorStudio({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    // Kiểm tra URL hiện tại để bật trạng thái active cho nút sidebar tương ứng
    const getActiveTab = () => {
        if (location.pathname.includes("/quiz-manager")) return "quiz-manager";
        if (location.pathname.includes("/dashboard")) return "dashboard";
        if (location.pathname.includes("/interaction-manager")) return "interaction-manager";
        return "my-courses";
    };

    const activeTab = getActiveTab();

    return (
        <div className="studio-container">
            
            {/* ================= HEADER BAR ================= */}
            <header className="studio-header">
                <div className="header-left">
                    <span 
                        className="logo-text" 
                        onClick={() => navigate("/instructor-studio")}
                        title="Trang chủ Instructor Studio"
                    >
                        ieltstrainer
                    </span>
                </div>

                <div className="header-search">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="header-right">
                    <button className="new-course-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Course
                    </button>

                    <button 
                        className="icon-btn bell-btn" 
                        aria-label="Notifications"
                        onClick={() => navigate("/notifications")}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>

                    <div 
                        className="avatar-circle" 
                        onClick={() => navigate("/my-account")} 
                        title="My Account"
                    ></div>
                </div>
            </header>

            {/* ================= MAIN BODY (SIDEBAR + CONTENT) ================= */}
            <div className="studio-body">
                
                {/* ---------- SIDEBAR NAVIGATION ---------- */}
                <aside className="studio-sidebar">
                    <span className="nav-title">NAVIGATION</span>
                    <nav className="nav-menu">
                        {/* 1. My Courses */}
                        <button 
                            className={`nav-item ${activeTab === "my-courses" ? "active" : ""}`}
                            onClick={() => navigate("/instructor-studio")}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                                <path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5H20"></path>
                            </svg>
                            <span>My Courses</span>
                        </button>

                        {/* 2. Quiz Manager */}
                        <button 
                            className={`nav-item ${activeTab === "quiz-manager" ? "active" : ""}`}
                            onClick={() => navigate("/quiz-manager")}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            <span>Quiz Manager</span>
                        </button>

                        {/* 3. Dashboard */}
                        <button 
                            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                            onClick={() => navigate("/dashboard")}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Dashboard</span>
                        </button>

                    </nav>
                </aside>

                {/* ---------- CONTENT AREA ---------- */}
                <main className="studio-content">
                    {/* Nếu có component con truyền vào (như QuizManager) thì hiển thị, ngược lại hiển thị nội dung My Courses mặc định */}
                    {children ? (
                        children
                    ) : (
                        <div className="tab-content">
                            <section className="courses-section">
                                <h2>Recently</h2>
                                <div className="recent-list">
                                    {/* Khóa học 1 */}
                                        <div 
                                            className="course-item"
                                            onClick={() => navigate("/course-1")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="course-thumb">
                                                <img src={ielts_1} alt="IELTS Academic Mastery" />
                                            </div>
                                            <div className="course-title">
                                                IELTS Academic Mastery: Band 7.5 Intensive Program
                                            </div>
                                        </div>

                                        {/* Khóa học 2 */}
                                        <div 
                                            className="course-item"
                                            onClick={() => navigate("/course-2")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="course-thumb">
                                                <img src={ielts_2} alt="IELTS Listening & Reading" />
                                            </div>
                                            <div className="course-title">
                                                IELTS Listening & Reading: Full Practice & Test Strategies
                                            </div>
                                        </div>

                                        {/* Khóa học 3 */}
                                        <div 
                                            className="course-item"
                                            onClick={() => navigate("/course-3")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="course-thumb">
                                                <img src={ielts_3} alt="IELTS Speaking & Writing" />
                                            </div>
                                            <div className="course-title">
                                                IELTS Speaking & Writing: Band 8.0 Expert Masterclass
                                            </div>
                                        </div>
                                </div>
                            </section>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}