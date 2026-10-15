import React from "react";
import { useNavigate } from "react-router-dom";
import InstructorStudio from "../Instructor/InstructorStudio";
import "./QuizManager.css";

export default function QuizManager() {
    const navigate = useNavigate();

    const recentQuizzes = [
        { id: 1, title: "Quiz1", path: "/path" },
        { id: 2, title: "Quiz2", path: "/path" },
    ];

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

                {/* ---------- DANH SÁCH QUIZ ---------- */}
                <section className="quiz-section">
                    <div className="quiz-list">
                        {recentQuizzes.map((quiz) => (
                            <div key={quiz.id} className="quiz-card">
                                <div className="quiz-card-left">
                                    <div className="quiz-icon-wrapper">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" />
                                        </svg>
                                    </div>

                                    <div className="quiz-details">
                                        <a href={`#quiz-${quiz.id}`} className="quiz-title">
                                            {quiz.title}
                                        </a>
                                        <span className="quiz-path">{quiz.path}</span>
                                    </div>
                                </div>

                                <div className="quiz-card-right">
                                    <span className="pill-placeholder"></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="quiz-section">
                    <h2 className="quiz-section-title">All Quiz</h2>
                </section>

            </div>
        </InstructorStudio>
    );
}