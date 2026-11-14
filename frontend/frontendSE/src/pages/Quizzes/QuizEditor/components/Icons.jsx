// Bộ icon SVG dùng chung trong Quiz Editor (nét theo màu chữ hiện tại)
import React from "react";

const Svg = ({ children, ...props }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {children}
    </svg>
);

export const SkillIcon = ({ skill }) => {
    if (skill === "listening") {
        return (
            <Svg>
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </Svg>
        );
    }
    if (skill === "reading") {
        return (
            <Svg>
                <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
                <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
            </Svg>
        );
    }
    if (skill === "writing") {
        return (
            <Svg>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </Svg>
        );
    }
    return (
        <Svg>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
        </Svg>
    );
};

export const PlusIcon = () => <Svg strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
export const CopyIcon = () => <Svg><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Svg>;
export const TrashIcon = () => <Svg><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Svg>;
export const ChevronIcon = ({ up }) => <Svg>{up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}</Svg>;
export const ArrowUpIcon = () => <Svg><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></Svg>;
export const ArrowDownIcon = () => <Svg><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></Svg>;
export const UploadIcon = () => <Svg><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Svg>;
export const CloudCheckIcon = () => <Svg><path d="M19 11a4 4 0 0 0-4-4 4 4 0 0 0-7.85 1A4.002 4.002 0 0 0 4 15a4 4 0 0 0 4 4h11a3 3 0 0 0 0-6z" /><path d="m9 15 2 2 4-4" /></Svg>;
export const EyeIcon = () => <Svg><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Svg>;
export const SendIcon = () => <Svg><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Svg>;
export const PencilIcon = () => <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Svg>;
export const KeyIcon = () => <Svg><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3 21 2M16 7l3 3M18 5l2 2" /></Svg>;
export const PinIcon = () => <Svg><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Svg>;
export const InfoIcon = () => <Svg><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Svg>;
export const CheckCircleIcon = () => <Svg><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></Svg>;
export const AlertCircleIcon = () => <Svg><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Svg>;
export const BackIcon = () => <Svg><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Svg>;
export const SearchIcon = () => <Svg><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Svg>;
export const ClockIcon = () => <Svg><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Svg>;
export const XIcon = () => <Svg><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>;
