import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Course_1.css";

// Import hình ảnh từ assets
import ielts_1 from "../../assets/ielts_1.jpg";

// Các nhóm file đính kèm trong modal Edit lesson (dấu + ở phần Metadata)
// accept: loại file được phép chọn trong hộp thoại của máy
const METADATA_TYPES = [
    { key: "video", label: "Add a video", accept: "video/*" },
    { key: "handout", label: "Add a handout/guide", accept: ".pdf,.doc,.docx,.ppt,.pptx,.txt" },
    { key: "quiz", label: "Add exercises from the quiz bank", accept: ".pdf,.doc,.docx,.xls,.xlsx,.csv,.json" }
];

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const countAttachments = (lesson) =>
    Object.values(lesson.attachments ?? {}).reduce((sum, files) => sum + files.length, 0);

export default function Course_1() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("syllabus"); // Đặt mặc định xem tab Syllabus
    const [searchQuery, setSearchQuery] = useState("");

    // Dữ liệu danh sách bài học (Syllabus)
    const [lessons, setLessons] = useState([
        {
            id: 1,
            duration: "90 min",
            title: "Lesson 1: Welcome & Course Orientation",
            description: "Overview of the 8-week roadmap, how live sessions + replays work, and how to use the student portal. Quick intro round so Ms. Thompson can get a sense of everyone's current level and goals."
        },
        {
            id: 2,
            duration: "90 min",
            title: "Lesson 2: Understanding the IELTS Academic Test Format",
            description: "Breakdown of all 4 sections (Listening, Reading, Writing, Speaking), timing, question types, and how the test is scored. Clears up common myths about the exam."
        },
        {
            id: 3,
            duration: "90 min",
            title: "Lesson 3: Diagnostic Test — Full Practice Exam",
            description: "Students take a full-length timed mock test under real exam conditions to establish a baseline score before training begins. Duration: 90 min (self-paced, submit by end of week)"
        },
        {
            id: 4,
            duration: "90 min",
            title: "Lesson 4: Diagnostic Test Review & Score Breakdown",
            description: "Group review of diagnostic results. Ms. Thompson walks through common mistake patterns seen across the class and what they indicate about band level."
        },
        {
            id: 5,
            duration: "90 min",
            title: "Lesson 5: Understanding Band Descriptors (Part 1)",
            description: "Deep dive into how examiners score Speaking and Writing — what separates a 6 from a 7, and a 7 from a 7.5+."
        }
    ]);

    // ================= MODIFY / DELETE / ADD LESSON =================
    // editingLesson: null = modal đóng; có object = modal mở với bản nháp (draft) của lesson
    // Lesson chưa có id nghĩa là đang tạo mới (Add new lesson)
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonError, setLessonError] = useState("");

    const openModifyLesson = (lesson) => {
        setEditingLesson({ ...lesson }); // copy ra bản nháp, chưa đụng vào dữ liệu gốc
        setLessonError("");
    };

    const openAddLesson = () => {
        setEditingLesson({
            duration: "90 min",
            title: `Lesson ${lessons.length + 1}: `,
            description: ""
        });
        setLessonError("");
    };

    const closeLessonModal = () => {
        setEditingLesson(null);
        setLessonError("");
    };

    const handleLessonFieldChange = (field) => (e) => {
        setEditingLesson((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSaveLesson = () => {
        const title = editingLesson.title.trim();
        if (!title) {
            setLessonError("Please enter a lesson title.");
            return;
        }

        const cleaned = {
            ...editingLesson,
            title,
            duration: editingLesson.duration.trim() || "90 min",
            description: editingLesson.description.trim()
        };

        if (cleaned.id) {
            // Đang sửa: thay lesson cũ bằng bản đã chỉnh
            setLessons((prev) => prev.map((l) => (l.id === cleaned.id ? cleaned : l)));
        } else {
            // Đang tạo mới: thêm vào cuối danh sách
            setLessons((prev) => [...prev, { ...cleaned, id: Date.now() }]);
        }
        closeLessonModal();
    };

    const handleDeleteLesson = (lesson) => {
        if (window.confirm(`Delete "${lesson.title}"?`)) {
            setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
        }
    };

    // Chọn ảnh bìa từ máy
    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditingLesson((prev) => ({ ...prev, cover: URL.createObjectURL(file) }));
        e.target.value = ""; // cho phép chọn lại cùng 1 file
    };

    // Thêm file vào 1 nhóm metadata (video / handout / quiz)
    // URL.createObjectURL: link tạm trên máy, chỉ dùng được trong phiên này (chưa upload lên server)
    const handleAddAttachments = (key) => (e) => {
        const picked = Array.from(e.target.files || []);
        if (picked.length === 0) return;

        const newFiles = picked.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file)
        }));

        setEditingLesson((prev) => {
            const attachments = prev.attachments ?? {};
            return {
                ...prev,
                attachments: { ...attachments, [key]: [...(attachments[key] ?? []), ...newFiles] }
            };
        });
        e.target.value = "";
    };

    const handleRemoveAttachment = (key, fileId) => {
        setEditingLesson((prev) => ({
            ...prev,
            attachments: {
                ...prev.attachments,
                [key]: prev.attachments[key].filter((f) => f.id !== fileId)
            }
        }));
    };

    // Bấm phím Esc để đóng modal
    useEffect(() => {
        if (!editingLesson) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeLessonModal();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editingLesson]);

    // Dữ liệu tài liệu / đường link (Materials/Links)
    // type: "file" (pdf, docx...) hoặc "link" (trang web bên ngoài)
    // url: tạm thời để "#" cho file, sau này lấy đường dẫn thật từ backend
    const [materials, setMaterials] = useState([
        {
            id: 1,
            type: "file",
            name: "Mastering_IELTS_Speaking_Effortlessly.pdf",
            description: "Including topics and instructions on how to improve your speaking skill",
            url: "#"
        },
        {
            id: 2,
            type: "file",
            name: "essay-template.docx",
            description: "The template for the writing essay hw",
            url: "#"
        },
        {
            id: 3,
            type: "file",
            name: "study-guide.pdf",
            description: "Course guide and study plan",
            url: "#"
        },
        {
            id: 4,
            type: "link",
            name: "www.britishcouncil.org/band_description",
            description: "Official band description reference",
            url: "https://www.britishcouncil.org"
        }
    ]);

    const handleDeleteMaterial = (item) => {
        if (window.confirm(`Delete "${item.name}"?`)) {
            setMaterials((prev) => prev.filter((m) => m.id !== item.id));
        }
    };

    // ================= MODIFY / ADD MATERIAL =================
    // editingMaterial: null = modal đóng; có object = bản nháp đang sửa
    // Material chưa có id nghĩa là đang thêm mới
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [materialError, setMaterialError] = useState("");

    const openModifyMaterial = (item) => {
        setEditingMaterial({ ...item });
        setMaterialError("");
    };

    const openAddMaterial = () => {
        setEditingMaterial({ type: "link", name: "", description: "", url: "" });
        setMaterialError("");
    };

    const closeMaterialModal = () => {
        setEditingMaterial(null);
        setMaterialError("");
    };

    const handleMaterialFieldChange = (field) => (e) => {
        setEditingMaterial((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Đổi loại File <-> Link: xoá tên/đường dẫn cũ để tránh lẫn dữ liệu
    const handleMaterialTypeChange = (type) => {
        setEditingMaterial((prev) =>
            prev.type === type ? prev : { ...prev, type, name: "", url: "" }
        );
        setMaterialError("");
    };

    // Chọn file từ máy: tạm dùng URL cục bộ (chỉ sống trong phiên này, chưa upload lên server)
    const handleMaterialFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditingMaterial((prev) => ({
            ...prev,
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setMaterialError("");
    };

    const handleSaveMaterial = () => {
        const draft = {
            ...editingMaterial,
            name: editingMaterial.name.trim(),
            url: editingMaterial.url.trim(),
            description: editingMaterial.description.trim()
        };

        if (draft.type === "link") {
            if (!draft.url) {
                setMaterialError("Please enter a URL.");
                return;
            }
            // Tự thêm https:// nếu người dùng chỉ gõ www.example.com
            if (!/^https?:\/\//i.test(draft.url)) {
                draft.url = `https://${draft.url}`;
            }
            // Không nhập tên hiển thị thì dùng chính đường link (bỏ https://)
            if (!draft.name) {
                draft.name = draft.url.replace(/^https?:\/\//i, "");
            }
        } else if (!draft.name) {
            setMaterialError("Please choose a file.");
            return;
        }

        if (draft.id) {
            setMaterials((prev) => prev.map((m) => (m.id === draft.id ? draft : m)));
        } else {
            setMaterials((prev) => [...prev, { ...draft, id: Date.now() }]);
        }
        closeMaterialModal();
    };

    // Bấm phím Esc để đóng modal Materials
    useEffect(() => {
        if (!editingMaterial) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeMaterialModal();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editingMaterial]);

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
        }
    ];

    const renderStars = (count) => {
        return Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className={idx < count ? "star-filled" : "star-empty"}>
                ★
            </span>
        ));
    };

    // Icon cho từng loại tài liệu
    const renderMaterialIcon = (type) => {
        if (type === "link") {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            );
        }
        return (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v1.5H8V13zm0 3h8v1.5H8V16z"></path>
            </svg>
        );
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

                {/* NÚT QUAY VỀ INSTRUCTOR STUDIO */}
                <button
                    className="back-btn"
                    onClick={() => navigate("/instructor-studio")}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to My Courses
                </button>

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

                {/* TABS NAVIGATION */}
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
                    {/* TAB REVIEW */}
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

                    {/* TAB SYLLABUS */}
                    {activeTab === "syllabus" && (
                        <div className="syllabus-container">
                            <div className="syllabus-list">
                                {lessons.map((lesson) => (
                                    <div key={lesson.id} className="lesson-card">
                                        {/* Thumbnail bài học màu xanh mint */}
                                        <div className="lesson-thumb-card">
                                            {lesson.cover ? (
                                                <img className="lesson-thumb-img" src={lesson.cover} alt="" />
                                            ) : (
                                                <div className="thumb-graphic">
                                                    <span className="graphic-title">IELTS</span>
                                                    <span className="graphic-sub">Test Report Form</span>
                                                    <div className="graphic-lines">
                                                        <div className="line line-long"></div>
                                                        <div className="line line-short"></div>
                                                    </div>
                                                </div>
                                            )}
                                            <span className="duration-badge">{lesson.duration}</span>
                                        </div>

                                        {/* Tiêu đề & Nội dung bài học */}
                                        <div className="lesson-details">
                                            <h3 className="lesson-title">{lesson.title}</h3>
                                            <p className="lesson-desc">{lesson.description}</p>
                                            {countAttachments(lesson) > 0 && (
                                                <span className="lesson-attachment-count">
                                                    📎 {countAttachments(lesson)} attached file(s)
                                                </span>
                                            )}
                                        </div>

                                        {/* Nút hành động dành cho Instructor */}
                                        <div className="lesson-actions">
                                            <button
                                                className="btn-modify"
                                                onClick={() => openModifyLesson(lesson)}
                                            >
                                                Modify
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteLesson(lesson)}
                                            >
                                                Delete
                                            </button>
                                            <button className="btn-drag-handle" aria-label="Reorder lesson">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M7 15l5 5 5-5"></path>
                                                    <path d="M7 9l5-5 5 5"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Nút thêm bài học mới ở cuối */}
                            <div className="add-lesson-wrapper">
                                <button className="add-lesson-btn" onClick={openAddLesson}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Add new lesson
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB MATERIALS / LINKS */}
                    {activeTab === "materials" && (
                        <div className="materials-container">
                            <div className="materials-list">
                                {materials.map((item) => (
                                    <div key={item.id} className="material-item">
                                        {/* Icon file / link */}
                                        <div className="material-icon">
                                            {renderMaterialIcon(item.type)}
                                        </div>

                                        {/* Tên + mô tả */}
                                        <div className="material-info">
                                            <a
                                                className="material-name"
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {item.name}
                                            </a>
                                            <span className="material-desc">{item.description}</span>
                                        </div>

                                        {/* Nút hành động (dùng lại style của Syllabus) */}
                                        <div className="lesson-actions">
                                            <button
                                                className="btn-modify"
                                                onClick={() => openModifyMaterial(item)}
                                            >
                                                Modify
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteMaterial(item)}
                                            >
                                                Delete
                                            </button>
                                            <button className="btn-drag-handle" aria-label="Reorder material">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M7 15l5 5 5-5"></path>
                                                    <path d="M7 9l5-5 5 5"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Nút thêm link mới */}
                            <button className="add-material-btn" onClick={openAddMaterial}>
                                <span className="add-material-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </span>
                                Add new link
                            </button>
                        </div>
                    )}
                </div>

            </main>

            {/* ================= LESSON EDIT MODAL ================= */}
            {editingLesson && (
                <div className="lesson-modal-backdrop" onClick={closeLessonModal}>
                    <div
                        className="lesson-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()} // bấm bên trong modal không bị đóng
                    >
                        <div className="lesson-modal-top">
                            <h2 className="lesson-modal-heading">
                                {editingLesson.id ? "Edit lesson" : "New lesson"}
                            </h2>
                            <div className="lesson-modal-top-actions">
                                <button className="btn-cancel" onClick={closeLessonModal}>Cancel</button>
                                <button className="btn-done" onClick={handleSaveLesson}>Done</button>
                            </div>
                        </div>

                        <div className="lesson-modal-body">
                            {/* Ô ảnh bìa: bấm vào để chọn ảnh từ máy */}
                            <label className="lesson-modal-cover">
                                {editingLesson.cover ? (
                                    <>
                                        <img src={editingLesson.cover} alt="Lesson cover" />
                                        <span className="cover-change-hint">Change cover</span>
                                    </>
                                ) : (
                                    "Upload Cover"
                                )}
                                <input type="file" accept="image/*" hidden onChange={handleCoverChange} />
                            </label>

                            <div className="lesson-modal-fields">
                                <label className="lesson-field">
                                    <span>Title</span>
                                    <input
                                        type="text"
                                        value={editingLesson.title}
                                        onChange={handleLessonFieldChange("title")}
                                        autoFocus
                                    />
                                </label>

                                <label className="lesson-field lesson-field-short">
                                    <span>Duration</span>
                                    <input
                                        type="text"
                                        value={editingLesson.duration}
                                        onChange={handleLessonFieldChange("duration")}
                                        placeholder="90 min"
                                    />
                                </label>

                                <label className="lesson-field">
                                    <span>Description</span>
                                    <textarea
                                        rows={5}
                                        value={editingLesson.description}
                                        onChange={handleLessonFieldChange("description")}
                                    />
                                </label>

                                {lessonError && <p className="lesson-modal-error">{lessonError}</p>}
                            </div>
                        </div>

                        {/* Metadata: bấm dấu + để mở cửa sổ chọn file trên máy */}
                        <div className="lesson-modal-metadata">
                            <h3>Metadata</h3>
                            {METADATA_TYPES.map((meta) => {
                                const files = editingLesson.attachments?.[meta.key] ?? [];
                                return (
                                    <div key={meta.key} className="metadata-group">
                                        {/* <label> bọc <input type="file" hidden>: bấm vào là mở hộp thoại chọn file */}
                                        <label className="metadata-btn">
                                            <span className="metadata-plus">+</span>
                                            {meta.label}
                                            <input
                                                type="file"
                                                accept={meta.accept}
                                                multiple
                                                hidden
                                                onChange={handleAddAttachments(meta.key)}
                                            />
                                        </label>

                                        {files.length > 0 && (
                                            <ul className="attachment-list">
                                                {files.map((file) => (
                                                    <li key={file.id} className="attachment-item">
                                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                            {file.name}
                                                        </a>
                                                        <span className="attachment-size">{formatFileSize(file.size)}</span>
                                                        <button
                                                            type="button"
                                                            className="attachment-remove"
                                                            aria-label={`Remove ${file.name}`}
                                                            onClick={() => handleRemoveAttachment(meta.key, file.id)}
                                                        >
                                                            ×
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MATERIAL EDIT MODAL ================= */}
            {editingMaterial && (
                <div className="lesson-modal-backdrop" onClick={closeMaterialModal}>
                    <div
                        className="lesson-modal material-modal"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="lesson-modal-top">
                            <h2 className="lesson-modal-heading">
                                {editingMaterial.id ? "Edit material" : "New material"}
                            </h2>
                            <div className="lesson-modal-top-actions">
                                <button className="btn-cancel" onClick={closeMaterialModal}>Cancel</button>
                                <button className="btn-done" onClick={handleSaveMaterial}>Done</button>
                            </div>
                        </div>

                        <div className="lesson-modal-fields">
                            {/* Chọn loại: File hoặc Link */}
                            <div className="lesson-field">
                                <span>Type</span>
                                <div className="material-type-toggle">
                                    {["link", "file"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`type-option ${editingMaterial.type === type ? "active" : ""}`}
                                            onClick={() => handleMaterialTypeChange(type)}
                                        >
                                            <span className="type-option-icon">{renderMaterialIcon(type)}</span>
                                            {type === "link" ? "Link" : "File"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {editingMaterial.type === "link" ? (
                                <>
                                    <label className="lesson-field">
                                        <span>URL</span>
                                        <input
                                            type="text"
                                            value={editingMaterial.url}
                                            onChange={handleMaterialFieldChange("url")}
                                            placeholder="https://www.example.com/page"
                                            autoFocus
                                        />
                                    </label>
                                    <label className="lesson-field">
                                        <span>Display name (optional)</span>
                                        <input
                                            type="text"
                                            value={editingMaterial.name}
                                            onChange={handleMaterialFieldChange("name")}
                                            placeholder="Leave empty to show the URL"
                                        />
                                    </label>
                                </>
                            ) : (
                                <div className="lesson-field">
                                    <span>File</span>
                                    <div className="material-file-row">
                                        <label className="material-file-btn">
                                            {editingMaterial.name ? "Replace file" : "Choose file"}
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp3,.mp4"
                                                onChange={handleMaterialFileChange}
                                                hidden
                                            />
                                        </label>
                                        <span className="material-file-name">
                                            {editingMaterial.name || "No file chosen"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <label className="lesson-field">
                                <span>Description</span>
                                <textarea
                                    rows={3}
                                    value={editingMaterial.description}
                                    onChange={handleMaterialFieldChange("description")}
                                    placeholder="What is this material for?"
                                />
                            </label>

                            {materialError && <p className="lesson-modal-error">{materialError}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}