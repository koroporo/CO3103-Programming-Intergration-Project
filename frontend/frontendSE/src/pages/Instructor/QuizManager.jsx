import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructorStudio from "../Instructor/InstructorStudio";
import { deleteQuiz, listQuizzes } from "../Quizzes/data/quizStorage";
import { SKILLS } from "../Quizzes/data/quizDefaults";
import "./QuizManager.css";

// "5 min ago", "2 days ago"...
function timeAgo(timestamp) {
    const minutes = Math.round((Date.now() - timestamp) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

const skillNames = (skills) =>
    SKILLS.filter((s) => skills.includes(s.key)).map((s) => s.label).join(", ");

export default function QuizManager() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState(() => listQuizzes());

    const recentQuizzes = quizzes.slice(0, 3);
    const allQuizzes = [...quizzes].sort((a, b) => a.title.localeCompare(b.title));

    const handleDelete = (quiz) => {
        if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
        deleteQuiz(quiz.id);
        setQuizzes(listQuizzes());
    };

    const renderQuizCard = (quiz) => (
        <div key={quiz.id} className="quiz-card">
            <div className="quiz-card-left">
                <div className="quiz-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" />
                    </svg>
                </div>

                <div className="quiz-details">
                    <button className="quiz-title" onClick={() => navigate(`/quiz-editor/${quiz.id}`)}>
                        {quiz.title}
                    </button>
                    <span className="quiz-path">
                        {skillNames(quiz.skills)} · edited {timeAgo(quiz.updatedAt)}
                    </span>
                </div>
            </div>

            <div className="quiz-card-right">
                <span className={`quiz-status ${quiz.status}`}>
                    {quiz.status === "published" ? "Published" : "Draft"}
                </span>
                <button
                    className="quiz-delete-btn"
                    onClick={() => handleDelete(quiz)}
                    aria-label={`Delete ${quiz.title}`}
                    title="Delete quiz"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                    </svg>
                </button>
            </div>
        </div>
    );

    return (
        <InstructorStudio>
            <div className="quiz-manager-container">

                {/* ---------- HEADER CÓ NÚT TẠO QUIZ MỚI ---------- */}
                <div className="quiz-manager-header">
                    <h2 className="quiz-section-title">Recently</h2>
                    <button
                        className="create-quiz-btn"
                        onClick={() => navigate("/quiz-builder")}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Quiz
                    </button>
                </div>

                {/* ---------- RECENTLY: 3 đề sửa gần nhất ---------- */}
                <section className="quiz-section">
                    <div className="quiz-list">
                        {recentQuizzes.length > 0 ? (
                            recentQuizzes.map(renderQuizCard)
                        ) : (
                            <p className="quiz-empty">No quizzes yet. Click “New Quiz” to create your first test.</p>
                        )}
                    </div>
                </section>

                {/* ---------- ALL QUIZ: sắp xếp theo tên ---------- */}
                <section className="quiz-section">
                    <h2 className="quiz-section-title">All Quiz ({allQuizzes.length})</h2>
                    <div className="quiz-list">{allQuizzes.map(renderQuizCard)}</div>
                </section>

            </div>
        </InstructorStudio>
    );
}