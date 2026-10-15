import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Course_1.css";

// Import hình ảnh từ assets
import ielts_1 from "../../assets/ielts_1.jpg";

export default function Course_1() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("review");
    const [searchQuery, setSearchQuery] = useState("");

    const reviews = [
        {
            id: 1,
            initials: "MA",
            name: "Minh Anh T.",
            rating: 5.0,
            stars: 5,
            time: "6 months ago",
            comment: "I went from Band 6.0 to 7.5 in just 8 weeks! Ms. Thompson's feedback on my Writing Task 2 essays was incredibly detailed and helped me fix mistakes I didn't even know I was making."
        },
        {
            id: 2,
            initials: "DK",
            name: "David K",
            rating: 4.0,
            stars: 4,
            time: "8 months ago",
            comment: "Good course overall. Speaking practice sessions were the most useful part for me since I never get to practice English out loud otherwise. Wish there was a bit more 1-on-1 time though, group sessions got a little rushed sometimes."
        },
        {
            id: 3,
            initials: "HP",
            name: "Huyen P.",
            rating: 3.0,
            stars: 3,
            time: "8 months ago",
            comment: "content is solid but the pace felt fast for week 5-6, had to rewatch replays a few times to catch up. still learned a lot"
        },
        {
            id: 4,
            initials: "JO",
            name: "James O.",
            rating: 5.0,
            stars: 5,
            time: "9 months ago",
            comment: "Excellent preparation course! The tips for Listening and Reading saved me so much time during the actual test."
        }
    ];

    const renderStars = (count) => {
        return Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className={idx < count ? "star-filled" : "star-empty"}>
                ★
            </span>
        ));
    };

    return (
        <div className="course-detail-container">
            {/* ================= HEADER BAR ================= */}
            <header className="course-header">
                <div className="header-left">
                    <span 
                        className="logo-text" 
                        onClick={() => navigate("/instructor-studio")}
                        title="Trở về Instructor Studio"
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

            {/* ================= MAIN CONTENT ================= */}
            <main className="course-detail-content">
                
                {/* BANNER KHÓA HỌC */}
                <div className="course-main-info">
                    <div className="course-thumb-large">
                        <img src={ielts_1} alt="IELTS Academic Mastery" />
                    </div>

                    <div className="course-summary">
                        <h1 className="course-title-text">
                            IELTS Academic Mastery: Band 7.5 Intensive Program
                        </h1>

                        <div className="instructor-info">
                            <div className="author-avatar-placeholder"></div>
                            <span className="author-name">Sarah Thompson</span>
                        </div>

                        <p className="course-description">
                            Master IELTS Academic with expert-led training designed to get you to Band 7.5+ in 8 weeks, taught by a certified IELTS examiner.
                        </p>

                        <div className="course-meta-row">
                            <div className="meta-left">
                                <span className="duration-text">
                                    <strong>Duration:</strong> 8 weeks (24 sessions, 90 min each)
                                </span>

                                <div className="badges-group">
                                    <span className="badge badge-category">IELTS Academic</span>
                                    <span className="badge badge-rating">★ ★ ★ ★ ★ 4.8</span>
                                    <span className="badge badge-enrolled">Enrolled by 2340+</span>
                                </div>
                            </div>

                            <button className="edit-course-btn">Edit</button>
                        </div>
                    </div>
                </div>

                {/* PREREQUISITES */}
                <section className="prerequisites-section">
                    <h3>Prerequisites</h3>
                    <ul>
                        <li>Minimum English level: Intermediate (B1) or above</li>
                        <li>Recommended prior score: IELTS 5.5–6.0 or equivalent</li>
                        <li>A working microphone for speaking practice sessions</li>
                        <li>Commitment of 6–8 hours/week (class + homework)</li>
                    </ul>
                </section>

                {/* TABS */}
                <div className="course-tabs-nav">
                    <button 
                        className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
                        onClick={() => setActiveTab("review")}
                    >
                        Review
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "syllabus" ? "active" : ""}`}
                        onClick={() => setActiveTab("syllabus")}
                    >
                        Syllabus
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
                        onClick={() => setActiveTab("materials")}
                    >
                        Materials/Links
                    </button>
                </div>

                {/* TAB CONTENT */}
                <div className="tab-body">
                    {activeTab === "review" && (
                        <div className="reviews-list">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="review-card">
                                    <div className="review-avatar">
                                        {rev.initials}
                                    </div>
                                    <div className="review-content">
                                        <div className="review-header">
                                            <strong className="reviewer-name">{rev.name}</strong>
                                        </div>
                                        <div className="review-sub-header">
                                            <div className="stars-wrapper">{renderStars(rev.stars)}</div>
                                            <span className="rating-num">{rev.rating.toFixed(1)}</span>
                                            <span className="dot-separator">•</span>
                                            <span className="review-time">{rev.time}</span>
                                        </div>
                                        <p className="review-text">{rev.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "syllabus" && (
                        <div className="placeholder-tab-content">
                            <h3>Course Syllabus</h3>
                            <p>Syllabus modules and session schedule will be displayed here.</p>
                        </div>
                    )}

                    {activeTab === "materials" && (
                        <div className="placeholder-tab-content">
                            <h3>Course Materials & Links</h3>
                            <p>Downloadable PDFs, exercise files, and external links will be listed here.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}