import React, { useState } from "react";
import "./History.css";

export default function History()
{
    /**
     * const [ courses, setCourses ] = useState(null)
     * useEffect(()=>{
     * async function getHistory()
     * {
     * const response = await ...
     * const data = await respone.json();
     * setCourse(data);
     * }
     * },[])
     *  
     * 
     * } 
     */
    const mockAttempts = [
        { id: 1, title: "IELTS Reading Mock Test - Vol 5, Test 1", skill: "Reading", score: 7.5, maxScore: 9.0, date: "Today, 14:30", status: "completed", color: "#3b82f6", bg: "#dbeafe" },
        { id: 2, title: "IELTS Listening Practice - Section 3", skill: "Listening", score: 6.5, maxScore: 9.0, date: "Yesterday, 09:15", status: "completed", color: "#f97316", bg: "#ffedd5" },
        { id: 3, title: "IELTS Writing Task 2 - Education & Technology", skill: "Writing", score: 6.0, maxScore: 9.0, date: "Oct 8, 2026", status: "completed", color: "#a855f7", bg: "#f3e8ff" },
        { id: 4, title: "IELTS Speaking Part 1 & 2 - Personal Feedback", skill: "Speaking", score: null, maxScore: 9.0, date: "Oct 5, 2026", status: "grading", color: "#10b981", bg: "#d1fae5" }
    ];

    const [activeFilter, setActiveFilter] = useState("All Skills");
    const filters = ["All Skills", "Listening", "Reading", "Writing", "Speaking"];

    // Lọc dữ liệu theo filter đang chọn
    const filteredAttempts = activeFilter === "All Skills" 
        ? mockAttempts 
        : mockAttempts.filter(attempt => attempt.skill === activeFilter);

    // Hàm render SVG Icon tương ứng với kỹ năng
    const renderSkillIcon = (skill, color) => {
        switch (skill) {
            case "Reading":
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5H20"></path></svg>;
            case "Listening":
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>;
            case "Writing":
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>;
            case "Speaking":
                return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
            default:
                return null;
        }
    };

    // Component vẽ vòng tròn điểm số
    const ScoreRing = ({ score, maxScore, color }) => {
        if (!score) return <div className="grading-text" style={{color: "#d97706"}}>Grading...</div>;
        
        const radius = 24;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / maxScore) * circumference;

        return (
            <div className="score-ring-container">
                <svg width="60" height="60" viewBox="0 0 60 60">
                    {/* Vòng nền xám */}
                    <circle cx="30" cy="30" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    {/* Vòng màu điểm số */}
                    <circle cx="30" cy="30" r={radius} fill="none" stroke={color} strokeWidth="4" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round" 
                        transform="rotate(-90 30 30)" 
                    />
                </svg>
                <div className="score-value">
                    <strong>{score.toFixed(1)}</strong>
                    <span>/{maxScore.toFixed(1)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="history-page-wrapper">
            <div className="history-container">
                
                {/* Tiêu đề trang */}
                <div className="history-header">
                    <h1>History</h1>
                    <p>Track your IELTS practice attempts and progress</p>
                </div>

                {/* Thanh Lọc (Filters) */}
                <div className="history-filters">
                    <span className="filter-label">Filters</span>
                    <div className="filter-buttons">
                        {filters.map(filter => (
                            <button 
                                key={filter} 
                                className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Danh sách bài làm */}
                <div className="history-list">
                    {filteredAttempts.map((attempt) => (
                        <div className="history-card" key={attempt.id}>
                            
                            {/* Khối Icon & Tiêu đề */}
                            <div className="card-left">
                                <div className="skill-icon" style={{ backgroundColor: attempt.bg }}>
                                    {renderSkillIcon(attempt.skill, attempt.color)}
                                </div>
                                <div className="attempt-info">
                                    <h3>{attempt.title}</h3>
                                    <span className="skill-badge" style={{ backgroundColor: attempt.bg, color: attempt.color }}>
                                        {attempt.skill}
                                    </span>
                                </div>
                            </div>

                            {/* Khối Điểm số */}
                            <div className="card-score">
                                <ScoreRing score={attempt.score} maxScore={attempt.maxScore} color={attempt.color} />
                            </div>

                            {/* Khối Ngày tháng */}
                            <div className="card-date">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <span>{attempt.date}</span>
                            </div>

                            {/* Nút View Details */}
                            <div className="card-action">
                                <button className="view-details-btn">View Details</button>
                            </div>

                        </div>
                    ))}
                    
                    {filteredAttempts.length === 0 && (
                        <div className="no-data-msg">No attempts found for {activeFilter}.</div>
                    )}
                </div>

            </div>
        </div>
    );
}