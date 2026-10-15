import React from "react";
import InstructorStudio from "./InstructorStudio";
import "./Dashboard.css";

export default function Dashboard() {
    // 1. Dữ liệu thẻ thống kê tổng quan
    const stats = [
        { 
            id: 1, 
            label: "Total Students", 
            value: "1,248", 
            subText: "+12% this month", 
            type: "students", 
            color: "#3b82f6", 
            bg: "#dbeafe",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            )
        },
        { 
            id: 2, 
            label: "Active Courses", 
            value: "6", 
            subText: "2 in draft mode", 
            type: "courses", 
            color: "#a855f7", 
            bg: "#f3e8ff",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5H20"></path></svg>
            )
        },
        { 
            id: 3, 
            label: "Pending Grading", 
            value: "14", 
            subText: "Writing & Speaking", 
            type: "pending", 
            color: "#f97316", 
            bg: "#ffedd5",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            )
        },
        { 
            id: 4, 
            label: "Average Rating", 
            value: "4.9 / 5.0", 
            subText: "128 total reviews", 
            type: "rating", 
            color: "#10b981", 
            bg: "#d1fae5",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            )
        }
    ];

    // 2. Dữ liệu bài tập nộp gần đây cần giáo viên chấm
    const pendingGradings = [
        { id: 1, student: "Trần Hoàng Phúc", test: "IELTS Writing Task 2 - Education & Tech", skill: "Writing", time: "25 mins ago", skillBg: "#f3e8ff", skillColor: "#a855f7" },
        { id: 2, student: "Nguyen Van A", test: "IELTS Speaking Part 2 - Personal Experience", skill: "Speaking", time: "2 hours ago", skillBg: "#d1fae5", skillColor: "#10b981" },
        { id: 3, student: "Le Thi B", test: "IELTS Writing Task 1 - Line Graph Analysis", skill: "Writing", time: "5 hours ago", skillBg: "#f3e8ff", skillColor: "#a855f7" }
    ];

    // 3. Dữ liệu biểu đồ cột theo tuần
    const weeklyChartData = [
        { day: "Mon", count: 24, height: "55%" },
        { day: "Tue", count: 42, height: "85%" },
        { day: "Wed", count: 18, height: "40%" },
        { day: "Thu", count: 50, height: "95%" },
        { day: "Fri", count: 32, height: "70%" },
        { day: "Sat", count: 15, height: "35%" },
        { day: "Sun", count: 28, height: "60%" }
    ];

    // 4. Khóa học hàng đầu
    const topCourses = [
        { id: 1, name: "IELTS Academic Mastery 7.5+", students: 540, completion: 82 },
        { id: 2, name: "IELTS Speaking & Writing Band 8.0", students: 380, completion: 68 },
        { id: 3, name: "IELTS Listening & Reading Practice", students: 328, completion: 91 }
    ];

    return (
        <InstructorStudio>
            <div className="dashboard-container">
                
                {/* ---------- HEADER TITLE ---------- */}
                <div className="dashboard-header-text">
                    <h1>Instructor Dashboard</h1>
                    <p>Welcome back! Here is an overview of your IELTS teaching performance and student activities.</p>
                </div>

                {/* ---------- STATS GRID ---------- */}
                <div className="dashboard-stats-grid">
                    {stats.map(item => (
                        <div key={item.id} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                                {item.icon}
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">{item.label}</span>
                                <span className="stat-value">{item.value}</span>
                                <span className="stat-subtext">{item.subText}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ---------- MAIN TWO-COLUMN GRID ---------- */}
                <div className="dashboard-main-grid">
                    
                    {/* CỘT TRÁI */}
                    <div className="dashboard-col-left">
                        
                        {/* 1. Biểu đồ nộp bài tuần này */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h2>Weekly Submission Activity</h2>
                                <span className="badge-text">This Week</span>
                            </div>
                            
                            <div className="chart-wrapper">
                                {weeklyChartData.map((bar, idx) => (
                                    <div key={idx} className="chart-bar-item">
                                        <div className="bar-container">
                                            <div 
                                                className="bar-fill" 
                                                style={{ height: bar.height }}
                                                title={`${bar.count} submissions`}
                                            ></div>
                                        </div>
                                        <span className="bar-label">{bar.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Danh sách bài tập chờ chấm */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h2>Pending Grading ({pendingGradings.length})</h2>
                                <button className="view-all-link">View All</button>
                            </div>

                            <div className="grading-list">
                                {pendingGradings.map(item => (
                                    <div key={item.id} className="grading-item">
                                        <div className="grading-left">
                                            <span 
                                                className="skill-tag" 
                                                style={{ backgroundColor: item.skillBg, color: item.skillColor }}
                                            >
                                                {item.skill}
                                            </span>
                                            <div className="grading-text">
                                                <strong>{item.test}</strong>
                                                <span>Submitted by <em>{item.student}</em> • {item.time}</span>
                                            </div>
                                        </div>

                                        <button className="grade-now-btn">Grade Now</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* CỘT PHẢI */}
                    <div className="dashboard-col-right">
                        
                        {/* 1. Top Khóa học */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h2>Top Performing Courses</h2>
                            </div>

                            <div className="top-courses-list">
                                {topCourses.map(course => (
                                    <div key={course.id} className="top-course-item">
                                        <div className="top-course-info">
                                            <strong>{course.name}</strong>
                                            <span>{course.students} students enrolled</span>
                                        </div>
                                        
                                        <div className="completion-bar-wrapper">
                                            <div className="completion-bar">
                                                <div 
                                                    className="completion-fill" 
                                                    style={{ width: `${course.completion}%` }}
                                                ></div>
                                            </div>
                                            <span className="completion-percent">{course.completion}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Hộp nhắc nhở / Mẹo nhanh */}
                        <div className="dash-card notice-card">
                            <div className="notice-icon">💡</div>
                            <div className="notice-content">
                                <h3>Pro Tip for IELTS Instructors</h3>
                                <p>Providing feedback within 24 hours increases student retention and satisfaction rate by up to 35%!</p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </InstructorStudio>
    );
}