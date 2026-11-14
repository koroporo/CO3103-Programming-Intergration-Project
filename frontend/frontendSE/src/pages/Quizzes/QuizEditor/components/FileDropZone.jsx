// Ô kéo-thả file hoặc bấm để mở cửa sổ chọn file trên máy
import React, { useState } from "react";
import { createLocalFile } from "../../data/quizStorage";
import { UploadIcon } from "./Icons";

// accept: ví dụ ".mp3,.wav" ; maxMB: dung lượng tối đa
function isAccepted(file, accept) {
    if (!accept) return true;
    const name = file.name.toLowerCase();
    return accept.split(",").map((a) => a.trim().toLowerCase()).some((rule) => {
        if (rule.startsWith(".")) return name.endsWith(rule);
        if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
        return file.type === rule;
    });
}

export default function FileDropZone({ accept, maxMB, title, hint, onFile, compact = false }) {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");

    const handleFile = (file) => {
        if (!file) return;
        if (!isAccepted(file, accept)) {
            setError(`"${file.name}" is not a supported file type.`);
            return;
        }
        if (maxMB && file.size > maxMB * 1024 * 1024) {
            setError(`"${file.name}" is larger than ${maxMB} MB.`);
            return;
        }
        setError("");
        onFile(createLocalFile(file));
    };

    return (
        <div>
            <label
                className={`qe-dropzone ${dragging ? "dragging" : ""} ${compact ? "compact" : ""}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files?.[0]);
                }}
            >
                <span className="qe-dropzone-icon"><UploadIcon /></span>
                <strong>{title}</strong>
                <span>{hint}</span>
                <input
                    type="file"
                    accept={accept}
                    hidden
                    onChange={(e) => {
                        handleFile(e.target.files?.[0]);
                        e.target.value = "";
                    }}
                />
            </label>
            {error && <p className="qe-error-text">{error}</p>}
        </div>
    );
}

// Nút nhỏ "Replace ..." mở cửa sổ chọn file
export function ReplaceFileButton({ accept, label, onFile }) {
    return (
        <label className="qe-btn qe-btn-outline qe-btn-sm">
            <UploadIcon />
            {label}
            <input
                type="file"
                accept={accept}
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && isAccepted(file, accept)) onFile(createLocalFile(file));
                    e.target.value = "";
                }}
            />
        </label>
    );
}

export const formatBytes = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
