// Một nhóm câu hỏi (Group) trong Listening / Reading
// Giao diện bên trong thay đổi theo "kind" của dạng câu hỏi
import React from "react";
import { bankLabel, getQuestionType, uid, WORD_LIMITS } from "../../data/quizDefaults";
import { formatRange, isGroupComplete } from "../../data/quizUtils";
import {
    ArrowDownIcon, ArrowUpIcon, ChevronIcon, CopyIcon, InfoIcon, KeyIcon, PinIcon, PlusIcon, TrashIcon, XIcon
} from "./Icons";

const NUMBER_WORDS = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE"];

export default function QuestionGroup({
    group, index, range, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown
}) {
    const type = getQuestionType(group.type);
    const set = (patch) => onChange({ ...group, ...patch });
    const complete = isGroupComplete(group);

    return (
        <div className={`qe-group ${complete ? "" : "incomplete"}`}>
            <div className="qe-group-header">
                <div className="qe-group-title">
                    <span className="qe-grip" aria-hidden="true">⋮⋮</span>
                    <div>
                        <div className="qe-group-name">
                            Group {index + 1}
                            <span className="qe-range-badge">{formatRange(range)}</span>
                            {!complete && <span className="qe-todo-badge">Needs answers</span>}
                        </div>
                        <span className="qe-group-type">{type.label}</span>
                    </div>
                </div>

                <div className="qe-group-actions">
                    <button className="qe-icon-btn" onClick={onMoveUp} disabled={!onMoveUp} title="Move up" aria-label="Move group up"><ArrowUpIcon /></button>
                    <button className="qe-icon-btn" onClick={onMoveDown} disabled={!onMoveDown} title="Move down" aria-label="Move group down"><ArrowDownIcon /></button>
                    <button className="qe-icon-btn" onClick={onDuplicate} title="Duplicate" aria-label="Duplicate group"><CopyIcon /></button>
                    <button
                        className="qe-icon-btn danger"
                        title="Delete"
                        aria-label="Delete group"
                        onClick={() => window.confirm(`Delete Group ${index + 1}?`) && onDelete()}
                    >
                        <TrashIcon />
                    </button>
                    <button
                        className="qe-icon-btn"
                        title={group.collapsed ? "Expand" : "Collapse"}
                        aria-label={group.collapsed ? "Expand group" : "Collapse group"}
                        onClick={() => set({ collapsed: !group.collapsed })}
                    >
                        <ChevronIcon up={!group.collapsed} />
                    </button>
                </div>
            </div>

            {!group.collapsed && (
                <div className="qe-group-body">
                    <div className="qe-instruction">
                        <span className="qe-instruction-label"><InfoIcon /> Instruction</span>
                        <textarea
                            rows={2}
                            value={group.instruction}
                            onChange={(e) => set({ instruction: e.target.value })}
                        />
                    </div>

                    {type.kind === "mcq" && <McqEditor group={group} type={type} set={set} range={range} />}
                    {type.kind === "judgement" && <JudgementEditor group={group} type={type} set={set} range={range} />}
                    {type.kind === "matching" && <MatchingEditor group={group} type={type} set={set} range={range} />}
                    {type.kind === "completion" && <CompletionEditor group={group} set={set} range={range} />}
                </div>
            )}
        </div>
    );
}

// ---------------- Helpers cho danh sách item ----------------
const updateItem = (items, id, patch) => items.map((it) => (it.id === id ? { ...it, ...patch } : it));
const removeItem = (items, id) => items.filter((it) => it.id !== id);
const questionNumber = (range, i) => (range?.start ?? 1) + i;

// ---------------- Trắc nghiệm ----------------
function McqEditor({ group, type, set }) {
    const multi = type.id === "mcq-multi";
    const required = group.answersRequired;

    const toggleCorrect = (optionId) => {
        if (!multi) {
            set({ correct: [optionId] });
            return;
        }
        if (group.correct.includes(optionId)) {
            set({ correct: group.correct.filter((id) => id !== optionId) });
        } else if (group.correct.length < required) {
            set({ correct: [...group.correct, optionId] });
        }
    };

    const removeOption = (optionId) =>
        set({ options: removeItem(group.options, optionId), correct: group.correct.filter((id) => id !== optionId) });

    return (
        <>
            {multi && (
                <div className="qe-choose-banner">
                    <span>
                        Choose exactly{" "}
                        <select
                            value={required}
                            onChange={(e) => {
                                const n = Number(e.target.value);
                                set({ answersRequired: n, correct: group.correct.slice(0, n) });
                            }}
                        >
                            {[2, 3, 4].map((n) => <option key={n} value={n}>{NUMBER_WORDS[n]}</option>)}
                        </select>{" "}
                        answers
                    </span>
                    <span className={`qe-selected-count ${group.correct.length === required ? "ok" : ""}`}>
                        {group.correct.length} / {required} selected
                    </span>
                </div>
            )}

            <input
                className="qe-question-input"
                placeholder="Type the question…"
                value={group.question}
                onChange={(e) => set({ question: e.target.value })}
            />

            <div className="qe-options">
                {group.options.map((option, i) => {
                    const isCorrect = group.correct.includes(option.id);
                    return (
                        <div key={option.id} className={`qe-option ${isCorrect ? "correct" : ""}`}>
                            <button
                                className="qe-option-letter"
                                onClick={() => toggleCorrect(option.id)}
                                title={isCorrect ? "Correct answer (click to unmark)" : "Mark as correct"}
                                aria-pressed={isCorrect}
                            >
                                {String.fromCharCode(65 + i)}
                            </button>
                            <input
                                value={option.text}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                onChange={(e) => set({ options: updateItem(group.options, option.id, { text: e.target.value }) })}
                            />
                            {isCorrect && <span className="qe-option-key" title="Correct answer"><KeyIcon /></span>}
                            {group.options.length > 2 && (
                                <button className="qe-remove-btn" onClick={() => removeOption(option.id)} aria-label="Remove option"><XIcon /></button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="qe-row-between">
                <button
                    className="qe-link-btn"
                    disabled={group.options.length >= 8}
                    onClick={() => set({ options: [...group.options, { id: uid(), text: "" }] })}
                >
                    <PlusIcon /> Add option
                </button>
                <span className="qe-muted">Click a letter to mark the correct answer{multi ? "s" : ""}.</span>
            </div>

            <div className="qe-meta-row">
                <label className="qe-meta-field">
                    <InfoIcon />
                    <input
                        placeholder="Explanation (shown in answer key view)"
                        value={group.explanation}
                        onChange={(e) => set({ explanation: e.target.value })}
                    />
                </label>
                <label className="qe-meta-field evidence">
                    <PinIcon />
                    <input
                        placeholder="Evidence, e.g. paragraph B"
                        value={group.evidence}
                        onChange={(e) => set({ evidence: e.target.value })}
                    />
                </label>
            </div>
        </>
    );
}

// ---------------- True/False/Not Given, Yes/No/Not Given ----------------
function JudgementEditor({ group, type, set, range }) {
    return (
        <>
            {group.items.map((item, i) => (
                <div key={item.id} className="qe-item">
                    <span className="qe-item-number">{questionNumber(range, i)}</span>
                    <div className="qe-item-main">
                        <input
                            placeholder="Statement…"
                            value={item.text}
                            onChange={(e) => set({ items: updateItem(group.items, item.id, { text: e.target.value }) })}
                        />
                        <div className="qe-segmented" role="radiogroup" aria-label="Correct answer">
                            {type.choices.map((choice) => (
                                <button
                                    key={choice}
                                    role="radio"
                                    aria-checked={item.answer === choice}
                                    className={item.answer === choice ? "active" : ""}
                                    onClick={() => set({ items: updateItem(group.items, item.id, { answer: choice }) })}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </div>
                    {group.items.length > 1 && (
                        <button className="qe-remove-btn" onClick={() => set({ items: removeItem(group.items, item.id) })} aria-label="Remove statement"><XIcon /></button>
                    )}
                </div>
            ))}
            <button className="qe-link-btn" onClick={() => set({ items: [...group.items, { id: uid(), text: "", answer: "" }] })}>
                <PlusIcon /> Add statement
            </button>
        </>
    );
}

// ---------------- Matching ----------------
function MatchingEditor({ group, type, set, range }) {
    const labels = group.bank.map((_, i) => bankLabel(i, type.bankStyle));
    const bankTitle = type.bankStyle === "roman" ? "Heading bank" : "Options";

    const removeBankOption = (optionId) => {
        const removedIndex = group.bank.findIndex((b) => b.id === optionId);
        // Các nhãn phía sau bị dồn lên 1 bậc (iii → ii) → cập nhật đáp án cho khớp
        const items = group.items.map((it) => {
            const answerIndex = labels.indexOf(it.answer);
            if (answerIndex === -1) return it;
            if (answerIndex === removedIndex) return { ...it, answer: "" };
            if (answerIndex > removedIndex) return { ...it, answer: bankLabel(answerIndex - 1, type.bankStyle) };
            return it;
        });
        set({ bank: removeItem(group.bank, optionId), items });
    };

    return (
        <>
            <div className="qe-bank">
                <span className="qe-subtitle">{bankTitle}</span>
                {group.bank.map((option, i) => (
                    <div key={option.id} className="qe-bank-row">
                        <span className="qe-bank-label">{labels[i]}</span>
                        <input
                            value={option.text}
                            placeholder={type.bankStyle === "roman" ? "Heading text" : "Option text"}
                            onChange={(e) => set({ bank: updateItem(group.bank, option.id, { text: e.target.value }) })}
                        />
                        {group.bank.length > 2 && (
                            <button className="qe-remove-btn" onClick={() => removeBankOption(option.id)} aria-label="Remove option"><XIcon /></button>
                        )}
                    </div>
                ))}
                <button
                    className="qe-link-btn"
                    disabled={group.bank.length >= 15}
                    onClick={() => set({ bank: [...group.bank, { id: uid(), text: "" }] })}
                >
                    <PlusIcon /> Add {type.bankStyle === "roman" ? "heading" : "option"}
                </button>
            </div>

            {group.items.map((item, i) => (
                <div key={item.id} className="qe-item">
                    <span className="qe-item-number">{questionNumber(range, i)}</span>
                    <div className="qe-item-main">
                        <input
                            placeholder={type.bankStyle === "roman" ? "Paragraph A" : "Statement…"}
                            value={item.text}
                            onChange={(e) => set({ items: updateItem(group.items, item.id, { text: e.target.value }) })}
                        />
                        <label className={`qe-answer-pill ${item.answer ? "ok" : ""}`}>
                            <KeyIcon />
                            Correct answer:
                            <select
                                value={item.answer}
                                onChange={(e) => set({ items: updateItem(group.items, item.id, { answer: e.target.value }) })}
                            >
                                <option value="">—</option>
                                {labels.map((label) => <option key={label} value={label}>{label}</option>)}
                            </select>
                        </label>
                    </div>
                    {group.items.length > 1 && (
                        <button className="qe-remove-btn" onClick={() => set({ items: removeItem(group.items, item.id) })} aria-label="Remove question"><XIcon /></button>
                    )}
                </div>
            ))}
            <button className="qe-link-btn" onClick={() => set({ items: [...group.items, { id: uid(), text: "", answer: "" }] })}>
                <PlusIcon /> Add question
            </button>
        </>
    );
}

// ---------------- Completion (điền từ) ----------------
function CompletionEditor({ group, set, range }) {
    return (
        <>
            <div className="qe-word-limit">
                <select value={group.wordLimit} onChange={(e) => set({ wordLimit: e.target.value })}>
                    {WORD_LIMITS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <span className="qe-muted">Use ___ (three underscores) to mark the gap.</span>
            </div>

            {group.items.map((item, i) => (
                <div key={item.id} className="qe-item">
                    <span className="qe-item-number">{questionNumber(range, i)}</span>
                    <div className="qe-item-main">
                        <input
                            placeholder="During storms, the parks act as a temporary ___."
                            value={item.text}
                            onChange={(e) => set({ items: updateItem(group.items, item.id, { text: e.target.value }) })}
                        />
                        <label className={`qe-answer-pill ${String(item.answer).trim() ? "ok" : ""}`}>
                            <KeyIcon />
                            <input
                                placeholder="Answer (use / for alternatives)"
                                value={item.answer}
                                onChange={(e) => set({ items: updateItem(group.items, item.id, { answer: e.target.value }) })}
                            />
                        </label>
                    </div>
                    {group.items.length > 1 && (
                        <button className="qe-remove-btn" onClick={() => set({ items: removeItem(group.items, item.id) })} aria-label="Remove question"><XIcon /></button>
                    )}
                </div>
            ))}
            <button className="qe-link-btn" onClick={() => set({ items: [...group.items, { id: uid(), text: "", answer: "" }] })}>
                <PlusIcon /> Add question
            </button>
        </>
    );
}
