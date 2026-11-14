// ============================================================
// Quiz Editor: soạn đề IELTS theo 4 kỹ năng
// Route: /quiz-editor/:quizId
// ============================================================
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./QuizEditor.css";
import ProfileButton from "../../../components/Profile/ProfileButton";

import { createListeningPart, createPassage, MAX_SECTIONS, SKILLS } from "../data/quizDefaults";
import {
    buildNumbering, formatRange, getSections, isSectionComplete, isWritingTaskComplete,
    skillProgress, speakingPartStatus, validateQuiz
} from "../data/quizUtils";
import { getQuiz, saveQuiz } from "../data/quizStorage";

import ListeningEditor from "./editors/ListeningEditor";
import ReadingEditor from "./editors/ReadingEditor";
import WritingEditor from "./editors/WritingEditor";
import SpeakingEditor from "./editors/SpeakingEditor";
import {
    AlertCircleIcon, BackIcon, CheckCircleIcon, CloudCheckIcon, EyeIcon, PencilIcon, PlusIcon, SearchIcon, SendIcon, SkillIcon
} from "./components/Icons";

export default function QuizEditor() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [quiz, setQuiz] = useState(() => getQuiz(quizId));
    const [activeSkill, setActiveSkill] = useState(() => {
        const requested = location.state?.skill;
        const loaded = getQuiz(quizId);
        if (requested && loaded?.skills.includes(requested)) return requested;
        return loaded?.skills[0] ?? "listening";
    });
    // Part/passage đang mở của Listening và Reading
    const [activeSection, setActiveSection] = useState({});
    const [saveState, setSaveState] = useState("saved"); // saved | saving | error
    const [editingTitle, setEditingTitle] = useState(false);
    const [publishIssues, setPublishIssues] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const isFirstRender = useRef(true);

    // Tự lưu 0.6s sau lần thay đổi cuối
    useEffect(() => {
        if (!quiz) return undefined;
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return undefined;
        }
        setSaveState("saving");
        const timer = setTimeout(() => setSaveState(saveQuiz(quiz) ? "saved" : "error"), 600);
        return () => clearTimeout(timer);
    }, [quiz]);

    if (!quiz) {
        return (
            <div className="qe-page qe-not-found">
                <h2>Quiz not found</h2>
                <p className="qe-muted">It may have been deleted, or the link is incorrect.</p>
                <button className="qe-btn qe-btn-primary" onClick={() => navigate("/quiz-manager")}>Back to Quiz Manager</button>
            </div>
        );
    }

    // ---------- Cập nhật dữ liệu ----------
    const updateSkill = (skill) => (updater) =>
        setQuiz((q) => ({ ...q, [skill]: typeof updater === "function" ? updater(q[skill]) : updater }));
    const updateSettings = (patch) =>
        setQuiz((q) => ({ ...q, [activeSkill]: { ...q[activeSkill], settings: { ...q[activeSkill].settings, ...patch } } }));

    // ---------- Tab kỹ năng ----------
    const handleTabClick = (skill) => {
        if (!quiz.skills.includes(skill)) {
            const label = SKILLS.find((s) => s.key === skill).label;
            if (!window.confirm(`${label} is not part of this test yet. Add it?`)) return;
            setQuiz((q) => ({ ...q, skills: SKILLS.map((s) => s.key).filter((k) => q.skills.includes(k) || k === skill) }));
        }
        setActiveSkill(skill);
    };

    // ---------- Sidebar: Test structure ----------
    const sections = getSections(quiz, activeSkill);
    const numbering = buildNumbering(sections);
    const activeSectionId = sections.some((s) => s.id === activeSection[activeSkill])
        ? activeSection[activeSkill]
        : sections[0]?.id;

    const scrollTo = (id) => document.getElementById(`qe-section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

    let structureItems = [];
    if (activeSkill === "listening" || activeSkill === "reading") {
        structureItems = sections.map((s) => ({
            id: s.id,
            title: s.title,
            meta: formatRange(numbering.sectionRanges[s.id]),
            done: isSectionComplete(s, activeSkill),
            active: s.id === activeSectionId,
            onClick: () => setActiveSection((prev) => ({ ...prev, [activeSkill]: s.id }))
        }));
    } else if (activeSkill === "writing") {
        structureItems = quiz.writing.tasks.map((t, i) => ({
            id: t.id,
            title: `Task ${i + 1}`,
            meta: t.kind === "report" ? "Report" : "Essay",
            done: isWritingTaskComplete(t),
            onClick: () => scrollTo(t.id)
        }));
    } else {
        const status = speakingPartStatus(quiz.speaking);
        structureItems = ["part1", "part2", "part3"].map((key, i) => ({
            id: key,
            title: `Part ${i + 1}`,
            meta: ["Interview", "Cue card", "Discussion"][i],
            done: status[key],
            onClick: () => scrollTo(key)
        }));
    }

    const canAddSection = (activeSkill === "listening" || activeSkill === "reading") && sections.length < MAX_SECTIONS[activeSkill];

    const addSection = () => {
        if (activeSkill === "listening") {
            const part = createListeningPart(sections.length + 1);
            updateSkill("listening")((l) => ({ ...l, parts: [...l.parts, part] }));
            setActiveSection((prev) => ({ ...prev, listening: part.id }));
        } else {
            const passage = createPassage(sections.length + 1);
            updateSkill("reading")((r) => ({ ...r, passages: [...r.passages, passage] }));
            setActiveSection((prev) => ({ ...prev, reading: passage.id }));
        }
    };

    const deleteSection = (section) => {
        if (!window.confirm(`Delete ${section.title} and all its questions?`)) return;
        const key = activeSkill === "listening" ? "parts" : "passages";
        const prefix = activeSkill === "listening" ? "Part" : "Passage";
        updateSkill(activeSkill)((data) => ({
            ...data,
            // Đặt lại tên Part 1, Part 2... theo thứ tự mới
            [key]: data[key].filter((s) => s.id !== section.id).map((s, i) => ({ ...s, title: `${prefix} ${i + 1}` }))
        }));
        setActiveSection((prev) => ({ ...prev, [activeSkill]: undefined }));
    };

    // ---------- Publish ----------
    const handlePublish = () => {
        const issues = validateQuiz(quiz);
        if (issues.length === 0) setQuiz((q) => ({ ...q, status: "published" }));
        else setPublishIssues(issues);
    };

    const skillLabel = SKILLS.find((s) => s.key === activeSkill).label;
    const progress = skillProgress(quiz, activeSkill);
    const settings = quiz[activeSkill].settings;

    const editorProps = {
        data: quiz[activeSkill],
        onChange: updateSkill(activeSkill),
        activeId: activeSectionId,
        numbering,
        onDeleteSection: deleteSection
    };

    return (
        <div className="qe-page">
            {/* ================= HEADER ================= */}
            {/* Giống header của Instructor Studio / Quiz Manager: logo | search | New Course · chuông · avatar */}
            <header className="qe-header">
                <span className="qe-logo" onClick={() => navigate("/instructor-studio")} title="Back to Instructor Studio">
                    ieltstrainer
                </span>

                <label className="qe-header-search">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </label>

                <div className="qe-header-right">
                    <button className="qe-new-course-btn" onClick={() => navigate("/instructor-studio")}>
                        <PlusIcon />
                        New Course
                    </button>

                    <button className="qe-bell-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>

                    {/* Avatar + menu dùng chung của nhóm */}
                    <div className="qe-profile-slot">
                        <ProfileButton />
                    </div>
                </div>
            </header>

            {/* ================= SUB-HEADER: tên đề + tab kỹ năng + Publish ================= */}
            <div className="qe-subheader">
                <div className="qe-title-block">
                    <button className="qe-icon-btn" onClick={() => navigate("/quiz-manager")} title="Back to Quiz Manager" aria-label="Back to Quiz Manager">
                        <BackIcon />
                    </button>
                    <div>
                        <div className="qe-title-row">
                            {editingTitle ? (
                                <input
                                    className="qe-title-input"
                                    autoFocus
                                    value={quiz.title}
                                    onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
                                    onBlur={() => {
                                        setEditingTitle(false);
                                        if (!quiz.title.trim()) setQuiz((q) => ({ ...q, title: "Untitled IELTS test" }));
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                />
                            ) : (
                                <>
                                    <h1 title={quiz.title}>{quiz.title}</h1>
                                    <button className="qe-icon-btn qe-btn-xs" onClick={() => setEditingTitle(true)} aria-label="Rename test"><PencilIcon /></button>
                                </>
                            )}
                        </div>
                        <div className="qe-title-meta">
                            <span className={`qe-status ${quiz.status}`}>{quiz.status === "published" ? "Published" : "Draft"}</span>
                            <span className="qe-muted qe-small">{quiz.testType}</span>
                        </div>
                    </div>
                </div>

                {/* Tab kỹ năng: tab đang mở được tô đậm đúng với editor bên dưới */}
                <nav className="qe-skill-tabs" aria-label="Skills">
                    {SKILLS.map((skill) => {
                        const enabled = quiz.skills.includes(skill.key);
                        const p = skillProgress(quiz, skill.key);
                        const state = p.done >= p.target ? "done" : p.done > 0 ? "partial" : "empty";
                        return (
                            <button
                                key={skill.key}
                                className={`qe-skill-tab ${activeSkill === skill.key ? "active" : ""} ${enabled ? "" : "off"}`}
                                aria-current={activeSkill === skill.key ? "page" : undefined}
                                title={enabled ? skill.label : `${skill.label} (not in this test — click to add)`}
                                onClick={() => handleTabClick(skill.key)}
                            >
                                <SkillIcon skill={skill.key} />
                                {skill.label}
                                {enabled && <span className={`qe-tab-count ${state}`}>{p.done}/{p.target}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="qe-subheader-actions">
                    <span className={`qe-save-state ${saveState}`}>
                        {saveState === "error" ? <AlertCircleIcon /> : <CloudCheckIcon />}
                        {saveState === "saving" ? "Saving…" : saveState === "error" ? "Couldn't save" : "All changes saved"}
                    </span>
                    <button className="qe-btn qe-btn-outline" disabled title="Student preview is coming soon">
                        <EyeIcon /> Preview
                    </button>
                    <button className="qe-btn qe-btn-primary" onClick={handlePublish}>
                        <SendIcon /> {quiz.status === "published" ? "Published" : "Publish"}
                    </button>
                </div>
            </div>

            {/* ================= BODY: sidebar | editor | settings ================= */}
            <div className="qe-body">
                <aside className="qe-structure">
                    <span className="qe-panel-title">Test structure</span>
                    <div className="qe-structure-skill">
                        <SkillIcon skill={activeSkill} />
                        <span>{skillLabel}</span>
                        <span className="qe-muted qe-small qe-push-right">{progress.done}/{progress.target}</span>
                    </div>
                    <ul className="qe-structure-list">
                        {structureItems.map((item) => (
                            <li key={item.id}>
                                <button className={`qe-structure-item ${item.active ? "active" : ""}`} onClick={item.onClick}>
                                    <span className={`qe-dot ${item.done ? "done" : ""}`}>
                                        {item.done ? <CheckCircleIcon /> : <AlertCircleIcon />}
                                    </span>
                                    {item.title}
                                    <span className="qe-muted qe-small qe-push-right">{item.meta}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {canAddSection && (
                        <button className="qe-add-section" onClick={addSection}>
                            <PlusIcon /> Add {activeSkill === "listening" ? "part" : "passage"}
                        </button>
                    )}
                </aside>

                <main className="qe-main">
                    {activeSkill === "listening" && <ListeningEditor {...editorProps} />}
                    {activeSkill === "reading" && <ReadingEditor {...editorProps} />}
                    {activeSkill === "writing" && <WritingEditor {...editorProps} />}
                    {activeSkill === "speaking" && <SpeakingEditor {...editorProps} />}
                </main>

                <aside className="qe-settings">
                    <span className="qe-panel-title">Section settings</span>
                    <label className="qe-field">
                        <span>Time limit</span>
                        <input value={settings.timeLimit} onChange={(e) => updateSettings({ timeLimit: e.target.value })} />
                    </label>
                    <label className="qe-field">
                        <span>Band target</span>
                        <input value={settings.bandTarget} onChange={(e) => updateSettings({ bandTarget: e.target.value })} />
                    </label>
                    {activeSkill === "listening" && (
                        <div className="qe-toggle-row">
                            <span>Shuffle groups</span>
                            <button
                                role="switch"
                                aria-checked={settings.shuffle}
                                className={`qe-switch ${settings.shuffle ? "on" : ""}`}
                                onClick={() => updateSettings({ shuffle: !settings.shuffle })}
                            >
                                {settings.shuffle ? "On" : "Off"}
                            </button>
                        </div>
                    )}
                </aside>
            </div>

            {/* ================= Modal: chưa đủ điều kiện Publish ================= */}
            {publishIssues && (
                <div className="qe-modal-backdrop" onClick={() => setPublishIssues(null)}>
                    <div className="qe-modal qe-publish" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <div className="qe-modal-head">
                            <div>
                                <h2>{publishIssues.length} thing{publishIssues.length > 1 ? "s" : ""} to check before publishing</h2>
                                <p className="qe-muted">Students will see the test exactly as it is now.</p>
                            </div>
                        </div>
                        <ul className="qe-issue-list">
                            {publishIssues.map((issue) => (
                                <li key={issue}><AlertCircleIcon /> {issue}</li>
                            ))}
                        </ul>
                        <div className="qe-modal-foot">
                            <button
                                className="qe-btn qe-btn-ghost"
                                onClick={() => {
                                    setQuiz((q) => ({ ...q, status: "published" }));
                                    setPublishIssues(null);
                                }}
                            >
                                Publish anyway
                            </button>
                            <button className="qe-btn qe-btn-primary" onClick={() => setPublishIssues(null)}>
                                <CheckCircleIcon /> Keep editing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}