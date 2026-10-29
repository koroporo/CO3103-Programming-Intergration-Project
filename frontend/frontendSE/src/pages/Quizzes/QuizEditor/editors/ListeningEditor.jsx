// Listening editor: audio cho từng Part + các group câu hỏi
import React from "react";
import FileDropZone, { formatBytes, ReplaceFileButton } from "../components/FileDropZone";
import GroupList from "../components/GroupList";
import { TrashIcon } from "../components/Icons";
import { formatRange } from "../../data/quizUtils";

const AUDIO_ACCEPT = ".mp3,.wav,audio/mpeg,audio/wav";

export default function ListeningEditor({ data, activeId, numbering, onChange, onDeleteSection }) {
    const part = data.parts.find((p) => p.id === activeId) ?? data.parts[0];
    if (!part) return null;

    const updatePart = (patch) =>
        onChange((listening) => ({
            ...listening,
            parts: listening.parts.map((p) => (p.id === part.id ? { ...p, ...patch } : p))
        }));

    return (
        <div className="qe-editor-single">
            <div className="qe-breadcrumb">
                <span>Listening</span>›<span>{part.title}</span>›
                <strong>Questions {formatRange(numbering.sectionRanges[part.id])}</strong>
                {data.parts.length > 1 && (
                    <button className="qe-link-btn danger qe-push-right" onClick={() => onDeleteSection(part)}>
                        <TrashIcon /> Delete {part.title}
                    </button>
                )}
            </div>

            <section className="qe-card">
                <div className="qe-card-head">
                    <div>
                        <h3>Part audio</h3>
                        <p className="qe-muted">Upload one MP3 or WAV file, up to 100 MB.</p>
                    </div>
                    {part.audio?.url && (
                        <div className="qe-inline-actions">
                            <ReplaceFileButton accept={AUDIO_ACCEPT} label="Replace audio" onFile={(audio) => updatePart({ audio })} />
                            <button className="qe-btn qe-btn-ghost qe-btn-sm danger" onClick={() => updatePart({ audio: null })}>Remove</button>
                        </div>
                    )}
                </div>

                {part.audio?.url ? (
                    <div className="qe-audio">
                        <audio controls src={part.audio.url} />
                        <span className="qe-file-meta">{part.audio.name} · {formatBytes(part.audio.size)}</span>
                    </div>
                ) : (
                    <FileDropZone
                        accept={AUDIO_ACCEPT}
                        maxMB={100}
                        title="Drag and drop MP3/WAV here"
                        hint="or choose a file from your computer"
                        onFile={(audio) => updatePart({ audio })}
                    />
                )}
            </section>

            <GroupList
                skill="listening"
                groups={part.groups}
                groupRanges={numbering.groupRanges}
                onChange={(groups) => updatePart({ groups })}
            />
        </div>
    );
}
