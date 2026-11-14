// Speaking editor: Part 1 (interview), Part 2 (cue card), Part 3 (discussion)
import React from "react";
import FileDropZone, { formatBytes, ReplaceFileButton } from "../components/FileDropZone";
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, ClockIcon, PlusIcon, XIcon } from "../components/Icons";
import { uid } from "../../data/quizDefaults";
import { speakingPartStatus } from "../../data/quizUtils";

const AUDIO_ACCEPT = ".mp3,.wav,.m4a,audio/*";

// Danh sách câu hỏi đánh số, sửa/xoá/đổi thứ tự được
function QuestionList({ questions, onChange, placeholder }) {
    const update = (id, text) => onChange(questions.map((q) => (q.id === id ? { ...q, text } : q)));
    const move = (from, to) => {
        const next = [...questions];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        onChange(next);
    };

    return (
        <div className="qe-speaking-questions">
            {questions.map((q, i) => (
                <div key={q.id} className="qe-speaking-q">
                    <span className="qe-item-number">{i + 1}</span>
                    <input value={q.text} placeholder={placeholder} onChange={(e) => update(q.id, e.target.value)} />
                    <button className="qe-icon-btn" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move question up"><ArrowUpIcon /></button>
                    <button className="qe-icon-btn" disabled={i === questions.length - 1} onClick={() => move(i, i + 1)} aria-label="Move question down"><ArrowDownIcon /></button>
                    {questions.length > 1 && (
                        <button className="qe-remove-btn" onClick={() => onChange(questions.filter((x) => x.id !== q.id))} aria-label="Remove question"><XIcon /></button>
                    )}
                </div>
            ))}
            <button className="qe-link-btn" onClick={() => onChange([...questions, { id: uid(), text: "" }])}>
                <PlusIcon /> Add question
            </button>
        </div>
    );
}

const StatusPill = ({ ok }) => (
    <span className={`qe-pill ${ok ? "green" : "grey"}`}>{ok ? <><CheckCircleIcon /> Valid</> : "Incomplete"}</span>
);

export default function SpeakingEditor({ data, onChange }) {
    const status = speakingPartStatus(data);
    const updatePart = (part, patch) => onChange((speaking) => ({ ...speaking, [part]: { ...speaking[part], ...patch } }));
    const { part1, part2, part3 } = data;

    return (
        <div className="qe-editor-split speaking">
            <div className="qe-breadcrumb qe-span-2">
                <span>Speaking</span>›<strong>Interview flow</strong>
            </div>

            <div className="qe-span-2 qe-row-start">
                <h2 className="qe-editor-title">Speaking test</h2>
                <span className="qe-pill blue"><ClockIcon /> {data.settings.timeLimit}</span>
            </div>

            <div className="qe-stack">
                {/* ---------- Part 1 ---------- */}
                <section className="qe-card" id="qe-section-part1">
                    <div className="qe-card-head">
                        <div>
                            <h3>Part 1 · Introduction and interview</h3>
                            <span className="qe-muted qe-small">Topic: {part1.topic || "—"} · 4–5 minutes</span>
                        </div>
                        <StatusPill ok={status.part1} />
                    </div>
                    <label className="qe-field">
                        <span>Topic</span>
                        <input value={part1.topic} placeholder="Home and neighbourhood" onChange={(e) => updatePart("part1", { topic: e.target.value })} />
                    </label>
                    <QuestionList
                        questions={part1.questions}
                        placeholder="What kind of place do you live in?"
                        onChange={(questions) => updatePart("part1", { questions })}
                    />
                </section>

                {/* ---------- Part 3 ---------- */}
                <section className="qe-card" id="qe-section-part3">
                    <div className="qe-card-head">
                        <div>
                            <h3>Part 3 · Linked discussion</h3>
                            <span className="qe-muted qe-small">Linked to Part 2 · 4–5 minutes</span>
                        </div>
                        <span className="qe-pill blue">Linked</span>
                    </div>
                    <label className="qe-field">
                        <span>Discussion theme</span>
                        <input value={part3.topic} placeholder="Public places" onChange={(e) => updatePart("part3", { topic: e.target.value })} />
                    </label>
                    <QuestionList
                        questions={part3.questions}
                        placeholder="Why are public places important in cities?"
                        onChange={(questions) => updatePart("part3", { questions })}
                    />
                </section>
            </div>

            {/* ---------- Part 2: cue card ---------- */}
            <section className="qe-stack" id="qe-section-part2">
                <div className="qe-row-between">
                    <h3 className="qe-card-title">Part 2 · Individual long turn</h3>
                    <StatusPill ok={status.part2} />
                </div>

                <div className="qe-cue-card">
                    <input
                        className="qe-cue-title"
                        value={part2.prompt}
                        placeholder="Describe a public place you enjoy visiting."
                        onChange={(e) => updatePart("part2", { prompt: e.target.value })}
                    />
                    <span className="qe-cue-sub">You should say:</span>
                    <ul>
                        {part2.bullets.map((b) => (
                            <li key={b.id}>
                                <input
                                    value={b.text}
                                    placeholder="where the place is"
                                    onChange={(e) =>
                                        updatePart("part2", { bullets: part2.bullets.map((x) => (x.id === b.id ? { ...x, text: e.target.value } : x)) })
                                    }
                                />
                                {part2.bullets.length > 1 && (
                                    <button
                                        className="qe-remove-btn"
                                        aria-label="Remove bullet"
                                        onClick={() => updatePart("part2", { bullets: part2.bullets.filter((x) => x.id !== b.id) })}
                                    >
                                        <XIcon />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button
                        className="qe-link-btn"
                        disabled={part2.bullets.length >= 6}
                        onClick={() => updatePart("part2", { bullets: [...part2.bullets, { id: uid(), text: "" }] })}
                    >
                        <PlusIcon /> Add bullet
                    </button>
                </div>

                <div className="qe-two-cols">
                    <label className="qe-timer-box prep">
                        <span>Preparation</span>
                        <span className="qe-timer-input">
                            <input
                                type="number"
                                min={0}
                                value={part2.prepSeconds}
                                onChange={(e) => updatePart("part2", { prepSeconds: Number(e.target.value) || 0 })}
                            />
                            sec
                        </span>
                    </label>
                    <label className="qe-timer-box speak">
                        <span>Speaking</span>
                        <span className="qe-timer-input">
                            <input
                                type="number"
                                min={0}
                                value={part2.speakMinutes}
                                onChange={(e) => updatePart("part2", { speakMinutes: Number(e.target.value) || 0 })}
                            />
                            min
                        </span>
                    </label>
                </div>

                <div className="qe-field">
                    <span>Audio prompt (optional)</span>
                    {part2.audio?.url ? (
                        <div className="qe-audio compact">
                            <audio controls src={part2.audio.url} />
                            <div className="qe-row-between">
                                <span className="qe-file-meta">{part2.audio.name} · {formatBytes(part2.audio.size)}</span>
                                <div className="qe-inline-actions">
                                    <ReplaceFileButton accept={AUDIO_ACCEPT} label="Replace" onFile={(audio) => updatePart("part2", { audio })} />
                                    <button className="qe-btn qe-btn-ghost qe-btn-sm danger" onClick={() => updatePart("part2", { audio: null })}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <FileDropZone
                            compact
                            accept={AUDIO_ACCEPT}
                            maxMB={20}
                            title="Add audio prompt"
                            hint="MP3, WAV or M4A · up to 20 MB"
                            onFile={(audio) => updatePart("part2", { audio })}
                        />
                    )}
                </div>

                <label className="qe-field">
                    <span>Examiner follow-up</span>
                    <textarea
                        rows={3}
                        value={part2.followUp}
                        placeholder="Would you recommend this place to visitors? Why?"
                        onChange={(e) => updatePart("part2", { followUp: e.target.value })}
                    />
                </label>
            </section>
        </div>
    );
}
