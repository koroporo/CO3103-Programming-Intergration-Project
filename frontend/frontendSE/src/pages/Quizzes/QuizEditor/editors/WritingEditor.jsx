// Writing editor: Task 1 (report có biểu đồ) + Task 2 (essay), kèm khung xem trước như học viên thấy
import React, { useState } from "react";
import FileDropZone, { ReplaceFileButton } from "../components/FileDropZone";
import { CheckCircleIcon, PencilIcon } from "../components/Icons";
import { countWords, isWritingTaskComplete } from "../../data/quizUtils";

const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,.svg,image/*";

export default function WritingEditor({ data, onChange }) {
    const [previewTaskId, setPreviewTaskId] = useState(data.tasks[0]?.id);
    const [studentDraft, setStudentDraft] = useState("");
    const previewTask = data.tasks.find((t) => t.id === previewTaskId) ?? data.tasks[0];
    const previewIndex = data.tasks.indexOf(previewTask);
    const completeCount = data.tasks.filter(isWritingTaskComplete).length;

    const updateTask = (id, patch) =>
        onChange((writing) => ({
            ...writing,
            tasks: writing.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
        }));

    return (
        <div className="qe-editor-split writing">
            <div className="qe-breadcrumb qe-span-2">
                <span>Writing</span>›<strong>Academic module</strong>
                <span className={`qe-pill qe-push-right ${completeCount === data.tasks.length ? "green" : "orange"}`}>
                    {completeCount} of {data.tasks.length} complete
                </span>
            </div>

            <div className="qe-stack">
                <h2 className="qe-editor-title">Writing tasks</h2>

                {data.tasks.map((task, i) => {
                    const complete = isWritingTaskComplete(task);
                    return (
                        <section
                            key={task.id}
                            id={`qe-section-${task.id}`}
                            className={`qe-card qe-task ${previewTask?.id === task.id ? "focused" : ""}`}
                            onFocusCapture={() => setPreviewTaskId(task.id)}
                            onClick={() => setPreviewTaskId(task.id)}
                        >
                            <div className="qe-task-head">
                                <span className="qe-task-icon"><PencilIcon /></span>
                                <div>
                                    <h3>{task.title}</h3>
                                    <span className="qe-muted qe-small">
                                        {task.minWords} words minimum · {task.time} recommended
                                    </span>
                                </div>
                                <span className={`qe-pill qe-push-right ${complete ? "green" : "grey"}`}>
                                    {complete ? <><CheckCircleIcon /> Complete</> : "In progress"}
                                </span>
                            </div>

                            <label className="qe-field">
                                <span>Prompt *</span>
                                <textarea
                                    rows={4}
                                    value={task.prompt}
                                    placeholder={i === 0 ? "The chart below shows…" : "Some people believe that…"}
                                    onChange={(e) => updateTask(task.id, { prompt: e.target.value })}
                                />
                            </label>

                            {task.kind === "report" && (
                                <div className="qe-chart-row">
                                    <div className="qe-chart-box">
                                        {task.chart?.url ? (
                                            <img src={task.chart.url} alt={task.altText || "Task chart"} />
                                        ) : (
                                            <FileDropZone
                                                compact
                                                accept={IMAGE_ACCEPT}
                                                maxMB={10}
                                                title="Upload chart"
                                                hint="PNG, JPG or SVG · up to 10 MB"
                                                onFile={(chart) => updateTask(task.id, { chart })}
                                            />
                                        )}
                                    </div>
                                    <div className="qe-stack-sm">
                                        <label className="qe-field">
                                            <span>Alt text</span>
                                            <textarea
                                                rows={3}
                                                value={task.altText}
                                                placeholder="Describe the chart for screen readers"
                                                onChange={(e) => updateTask(task.id, { altText: e.target.value })}
                                            />
                                            <small className="qe-muted">Required for accessibility.</small>
                                        </label>
                                        {task.chart?.url && (
                                            <div className="qe-inline-actions">
                                                <ReplaceFileButton accept={IMAGE_ACCEPT} label="Replace chart" onFile={(chart) => updateTask(task.id, { chart })} />
                                                <button className="qe-btn qe-btn-ghost qe-btn-sm danger" onClick={() => updateTask(task.id, { chart: null })}>
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="qe-two-cols">
                                <label className="qe-field">
                                    <span>Minimum words</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={task.minWords}
                                        onChange={(e) => updateTask(task.id, { minWords: Number(e.target.value) || 0 })}
                                    />
                                </label>
                                <label className="qe-field">
                                    <span>Recommended time</span>
                                    <input value={task.time} onChange={(e) => updateTask(task.id, { time: e.target.value })} />
                                </label>
                            </div>

                            <label className="qe-field">
                                <span>Sample answer</span>
                                <textarea rows={3} value={task.sample} onChange={(e) => updateTask(task.id, { sample: e.target.value })} />
                            </label>
                            <label className="qe-field">
                                <span>Grading notes</span>
                                <textarea rows={3} value={task.grading} onChange={(e) => updateTask(task.id, { grading: e.target.value })} />
                            </label>
                        </section>
                    );
                })}
            </div>

            {/* ---------- Live student view ---------- */}
            {previewTask && (
                <aside className="qe-live-view">
                    <div className="qe-row-between">
                        <span className="qe-subtitle">Live student view</span>
                        <span className="qe-pill grey">Desktop</span>
                    </div>
                    <div className="qe-live-card">
                        <div className="qe-row-between">
                            <span className="qe-eyebrow">Writing task {previewIndex + 1}</span>
                            <span className="qe-muted qe-small">{previewTask.time}</span>
                        </div>
                        <p className="qe-live-instruction">
                            You should spend about {previewTask.time} on this task. Write at least {previewTask.minWords} words.
                        </p>
                        {previewTask.chart?.url && <img src={previewTask.chart.url} alt={previewTask.altText || "Task chart"} />}
                        <p className="qe-live-prompt">{previewTask.prompt || <em className="qe-muted">The prompt will appear here.</em>}</p>
                        <textarea
                            className="qe-live-answer"
                            rows={6}
                            placeholder="Type your answer here…"
                            value={studentDraft}
                            onChange={(e) => setStudentDraft(e.target.value)}
                        />
                        <span className="qe-muted qe-small qe-align-right">{countWords(studentDraft)} words</span>
                    </div>
                </aside>
            )}
        </div>
    );
}
