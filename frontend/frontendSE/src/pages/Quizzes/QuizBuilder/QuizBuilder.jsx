import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../data/quizStorage";
import { SKILLS } from "../data/quizDefaults";
import "./QuizBuilder.css";

export default function QuizBuilder() {
    const navigate = useNavigate();
    const [testTitle, setTestTitle] = useState("Untitled IELTS test");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // State chọn các kỹ năng trong đề thi
    const [selectedSkills, setSelectedSkills] = useState(["listening", "reading", "writing", "speaking"]);

    const [error, setError] = useState("");

    const toggleSkill = (skill) => {
        setError("");
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter((s) => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    // Tạo đề mới với tên + kỹ năng đã chọn, rồi mở Quiz Editor ở kỹ năng đầu tiên
    const handleCreateQuiz = () => {
        if (selectedSkills.length === 0) {
            setError("Select at least one skill for this test.");
            return;
        }
        const skills = SKILLS.map((s) => s.key).filter((key) => selectedSkills.includes(key));
        const quiz = createQuiz({ title: testTitle, skills });
        navigate(`/quiz-editor/${quiz.id}`, { state: { skill: skills[0] } });
    };

    return (
        <div className="quiz-builder-container">
            {/* ================= HEADER BAR ================= */}
            <header className="builder-header">
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
                    <button className="new-course-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Course
                    </button>

                    <button className="icon-btn bell-btn" aria-label="Notifications">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                    </button>

                    <div className="avatar-circle" onClick={() => navigate("/my-account")}></div>
                </div>
            </header>

            {/* ================= SUB-HEADER (TITLE & STATUS) ================= */}
            <div className="builder-subheader">
                <div className="title-section">
                    {isEditingTitle ? (
                        <input
                            type="text"
                            className="title-input"
                            value={testTitle}
                            onChange={(e) => setTestTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            autoFocus
                        />
                    ) : (
                        <div className="title-display">
                            <h2>{testTitle}</h2>
                            <button className="edit-title-btn" onClick={() => setIsEditingTitle(true)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                    <span className="badge-draft">Draft</span>
                </div>

                <div className="status-saved">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 11a4 4 0 0 0-4-4 4 4 0 0 0-7.85 1A4.002 4.002 0 0 0 4 15a4 4 0 0 0 4 4h11a3 3 0 0 0 0-6z"></path>
                        <path d="m9 15 2 2 4-4"></path>
                    </svg>
                    <span>All changes saved</span>
                </div>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <main className="builder-content">
                
                {/* SECTION 1: SET UP YOUR IELTS TEST */}
                <section className="setup-section">
                    <h1 className="section-heading">Set up your IELTS test</h1>
                    <p className="section-description">
                        Create the test structure first. You can change these settings until the test is published.
                    </p>

                    <div className="skills-grid">
                        {/* 1. LISTENING */}
                        <div 
                            className={`skill-card listening ${selectedSkills.includes("listening") ? "selected" : ""}`}
                            onClick={() => toggleSkill("listening")}
                        >
                            <div className="skill-card-top">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                                </svg>
                                <input type="checkbox" checked={selectedSkills.includes("listening")} readOnly />
                            </div>
                            <h3>Listening</h3>
                            <span>4 parts · 40 questions</span>
                        </div>

                        {/* 2. READING */}
                        <div 
                            className={`skill-card reading ${selectedSkills.includes("reading") ? "selected" : ""}`}
                            onClick={() => toggleSkill("reading")}
                        >
                            <div className="skill-card-top">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                                    <path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5H20"></path>
                                </svg>
                                <input type="checkbox" checked={selectedSkills.includes("reading")} readOnly />
                            </div>
                            <h3>Reading</h3>
                            <span>3 passages · 40 questions</span>
                        </div>

                        {/* 3. WRITING */}
                        <div 
                            className={`skill-card writing ${selectedSkills.includes("writing") ? "selected" : ""}`}
                            onClick={() => toggleSkill("writing")}
                        >
                            <div className="skill-card-top">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                <input type="checkbox" checked={selectedSkills.includes("writing")} readOnly />
                            </div>
                            <h3>Writing</h3>
                            <span>2 tasks</span>
                        </div>

                        {/* 4. SPEAKING */}
                        <div 
                            className={`skill-card speaking ${selectedSkills.includes("speaking") ? "selected" : ""}`}
                            onClick={() => toggleSkill("speaking")}
                        >
                            <div className="skill-card-top">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                    <line x1="12" y1="19" x2="12" y2="22"></line>
                                </svg>
                                <input type="checkbox" checked={selectedSkills.includes("speaking")} readOnly />
                            </div>
                            <h3>Speaking</h3>
                            <span>3 parts</span>
                        </div>
                    </div>
                    {error && <p className="builder-error">{error}</p>}
                </section>

                {/* SECTION 2: CHOOSE YOUR SETUP PATH */}
                <section className="setup-section">
                    <h2 className="section-heading-sm">Choose your setup path</h2>
                    <p className="section-description">
                        Start from scratch or upload a test file. Both paths are equivalent, so pick the one that fits your workflow best.
                    </p>

                    <div className="path-grid">
                        {/* PATH 1: MANUAL */}
                        <div className="path-column">
                            <span className="path-label">Add questions manually</span>
                            <div className="path-box manual-box" onClick={handleCreateQuiz}>
                                <div className="plus-icon-circle">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </div>
                                <strong>Start building your question bank</strong>
                                <span>Add questions, topics, and tags</span>
                            </div>

                            <button className="action-pill-btn green-btn" onClick={handleCreateQuiz}>
                                <span className="dot-icon"></span>
                                Create first question
                            </button>
                        </div>

                        {/* PATH 2: UPLOAD FILE */}
                        <div className="path-column">
                            <span className="path-label">Upload a test file</span>
                            <div className="path-box upload-box">
                                <div className="upload-icon-wrapper">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </div>
                                <strong>Drag and drop test file</strong>
                                <span>PDF or DOC · up to 10 MB</span>
                            </div>

                            <button className="action-pill-btn purple-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Browse files
                            </button>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}