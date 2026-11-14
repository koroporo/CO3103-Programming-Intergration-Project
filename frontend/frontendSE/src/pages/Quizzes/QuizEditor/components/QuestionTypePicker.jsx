// Modal "Add a question type": tìm kiếm + lọc theo nhóm, chỉ hiện dạng câu hỏi hợp với kỹ năng
import React, { useEffect, useMemo, useState } from "react";
import { QUESTION_TYPES } from "../../data/quizDefaults";
import { SearchIcon, XIcon } from "./Icons";

const CATEGORIES = ["All", "Choice", "Matching", "Completion"];

// Hình minh hoạ nhỏ cho từng nhóm
const TypeGlyph = ({ kind }) => (
    <span className={`qe-type-glyph ${kind}`} aria-hidden="true">
        <span /><span /><span />
    </span>
);

export default function QuestionTypePicker({ skill, onSelect, onClose }) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const types = useMemo(() => {
        const q = query.trim().toLowerCase();
        return QUESTION_TYPES.filter((t) =>
            t.skills.includes(skill) &&
            (category === "All" || t.category === category) &&
            (!q || t.label.toLowerCase().includes(q) || t.hint.toLowerCase().includes(q))
        );
    }, [query, category, skill]);

    return (
        <div className="qe-modal-backdrop" onClick={onClose}>
            <div className="qe-modal qe-picker" role="dialog" aria-modal="true" aria-labelledby="qe-picker-title" onClick={(e) => e.stopPropagation()}>
                <div className="qe-modal-head">
                    <div>
                        <h2 id="qe-picker-title">Add a question type</h2>
                        <p className="qe-muted">Pick the format for the next group. You can change its content anytime.</p>
                    </div>
                    <button className="qe-icon-btn" onClick={onClose} aria-label="Close"><XIcon /></button>
                </div>

                <div className="qe-picker-tools">
                    <label className="qe-search">
                        <SearchIcon />
                        <input
                            autoFocus
                            placeholder="Search question types"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </label>
                    <div className="qe-chips">
                        {CATEGORIES.map((c) => (
                            <button key={c} className={`qe-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="qe-type-grid">
                    {types.map((t) => (
                        <button key={t.id} className="qe-type-card" onClick={() => onSelect(t.id)}>
                            <TypeGlyph kind={t.kind} />
                            <span>
                                <strong>{t.label}</strong>
                                <small>{t.hint}</small>
                            </span>
                        </button>
                    ))}
                    {types.length === 0 && <p className="qe-muted">No question types match “{query}”.</p>}
                </div>

                <div className="qe-modal-foot">
                    <span className="qe-muted">{types.length} question types available for {skill}</span>
                    <button className="qe-btn qe-btn-outline" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
