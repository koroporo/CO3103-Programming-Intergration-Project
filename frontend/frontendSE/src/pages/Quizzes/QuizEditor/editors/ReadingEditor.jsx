// Reading editor: bài đọc (trái) + các group câu hỏi (phải)
import React from "react";
import GroupList from "../components/GroupList";
import { PlusIcon, TrashIcon, XIcon } from "../components/Icons";
import { uid } from "../../data/quizDefaults";
import { countWords, formatRange } from "../../data/quizUtils";

export default function ReadingEditor({ data, activeId, numbering, onChange, onDeleteSection }) {
    const index = Math.max(0, data.passages.findIndex((p) => p.id === activeId));
    const passage = data.passages[index];
    if (!passage) return null;

    const updatePassage = (patch) =>
        onChange((reading) => ({
            ...reading,
            passages: reading.passages.map((p) => (p.id === passage.id ? { ...p, ...patch } : p))
        }));

    const updateParagraph = (id, text) =>
        updatePassage({ paragraphs: passage.paragraphs.map((p) => (p.id === id ? { ...p, text } : p)) });

    const fullText = passage.paragraphs.map((p) => p.text).join(" ");
    const words = countWords(fullText);
    const range = numbering.sectionRanges[passage.id];
    const groupCount = passage.groups.length;

    return (
        <div className="qe-editor-split">
            <div className="qe-breadcrumb qe-span-2">
                <span>Reading</span>›<span>{passage.title}</span>›<strong>Questions {formatRange(range)}</strong>
                <span className="qe-push-right qe-pill blue">{passage.title} of {data.passages.length}</span>
                <span className="qe-pill orange">{range?.count ?? 0} questions</span>
                {data.passages.length > 1 && (
                    <button className="qe-link-btn danger" onClick={() => onDeleteSection(passage)}>
                        <TrashIcon /> Delete
                    </button>
                )}
            </div>

            {/* ---------- Bài đọc ---------- */}
            <section className="qe-card qe-passage">
                <div className="qe-row-between">
                    <span className="qe-eyebrow">Reading passage {index + 1}</span>
                    <span className={`qe-pill ${words >= 700 ? "green" : "grey"}`}>{words} words</span>
                </div>
                <input
                    className="qe-passage-title"
                    placeholder="Passage title"
                    value={passage.heading}
                    onChange={(e) => updatePassage({ heading: e.target.value })}
                />

                <div className="qe-paragraphs">
                    {passage.paragraphs.map((paragraph, i) => (
                        <div key={paragraph.id} className="qe-paragraph">
                            <span className="qe-paragraph-letter">{String.fromCharCode(65 + i)}</span>
                            <textarea
                                rows={Math.max(3, Math.ceil(paragraph.text.length / 48) + 1)}
                                placeholder="Paragraph text…"
                                value={paragraph.text}
                                onChange={(e) => updateParagraph(paragraph.id, e.target.value)}
                            />
                            {passage.paragraphs.length > 1 && (
                                <button
                                    className="qe-remove-btn"
                                    aria-label={`Remove paragraph ${String.fromCharCode(65 + i)}`}
                                    onClick={() => updatePassage({ paragraphs: passage.paragraphs.filter((p) => p.id !== paragraph.id) })}
                                >
                                    <XIcon />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        className="qe-link-btn"
                        disabled={passage.paragraphs.length >= 12}
                        onClick={() => updatePassage({ paragraphs: [...passage.paragraphs, { id: uid(), text: "" }] })}
                    >
                        <PlusIcon /> Add paragraph
                    </button>
                </div>

                <p className="qe-muted qe-small">
                    Recommended: 700–900 words for a complete passage<br />
                    {words} words · {fullText.length.toLocaleString()} characters
                </p>
            </section>

            {/* ---------- Câu hỏi ---------- */}
            <div>
                {groupCount > 0 && <p className="qe-muted qe-small">{groupCount} question group{groupCount > 1 ? "s" : ""}</p>}
                <GroupList
                    skill="reading"
                    groups={passage.groups}
                    groupRanges={numbering.groupRanges}
                    onChange={(groups) => updatePassage({ groups })}
                />
            </div>
        </div>
    );
}
