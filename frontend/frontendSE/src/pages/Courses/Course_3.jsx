import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Course_3.css";

// Import ảnh ielts_3 từ assets
import ielts_3 from "../../assets/ielts_3.jpg";

export default function Course_3() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("review");
    const [searchQuery, setSearchQuery] = useState("");

    const reviews = [
        {
            id: 1,
            initials: "HD",
            name: "Hai Dang V.",
            rating: 5.0,
            stars: 5,
            time: "1 month ago",
            comment: "This course helped me break through the Band 6.5 Speaking barrier. The advanced vocabulary bank and 1-on-1 mock feedback were invaluable."
        },
        {
            id: 2,
            initials: "NT",
            name: "Nhat Tien",
            rating: 5.0,
            stars: 5,
            time: "4 months ago",
            comment: "Ms. Thompson's Task 2 Writing templates and cohesive device guidelines are top tier! Scored an 8.0 in Writing on my second try."
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
                        <img src={ielts_3} alt="IELTS Speaking & Writing" />
                    </div>

                    <div className="course-summary">
                        <h1 className="course-title-text">
                            IELTS Speaking & Writing: Band 8.0 Expert Masterclass
                        </h1>

                        <div className="instructor-info">
                            <div className="author-avatar-placeholder"></div>
                            <span className="author-name">Sarah Thompson</span>
                        </div>

                        <p className="course-description">
                            Achieve high-band score in Speaking and Writing with advanced topic vocabulary, complex sentence structures, and personalized essay corrections.
                        </p>

                        <div className="course-meta-row">
                            <div className="meta-left">
                                <span className="duration-text">
                                    <strong>Duration:</strong> 10 weeks (30 sessions, 90 min each)
                                </span>

                                <div className="badges-group">
                                    <span className="badge badge-category">Speaking & Writing</span>
                                    <span className="badge badge-rating">★ ★ ★ ★ ★ 4.9</span>
                                    <span className="badge badge-enrolled">Enrolled by 1420+</span>
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
                        <li>Minimum English level: Upper-Intermediate (B2) or prior score IELTS 6.5+</li>
                        <li>A working microphone & webcam for 1-on-1 speaking evaluations</li>
                        <li>Commitment of 8–10 hours/week for essay writing assignments</li>
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
                            <p>Speaking cue-card topics and Task 1/Task 2 writing modules will be displayed here.</p>
                        </div>
                    )}

                    {activeTab === "materials" && (
                        <div className="placeholder-tab-content">
                            <h3>Course Materials & Links</h3>
                            <p>Band 8.0 sample essays, idiom handbooks, and video lesson links will be listed here.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}