// ============================================================
// Các hàm tính toán: đếm câu hỏi, đánh số, kiểm tra hoàn thành
// ============================================================
import { getQuestionType, SKILLS } from "./quizDefaults";

// Số câu hỏi của 1 group (MCQ nhiều đáp án tính theo số đáp án cần chọn)
export function countGroupQuestions(group) {
    const kind = getQuestionType(group.type).kind;
    if (kind === "mcq") return group.answersRequired || 1;
    return group.items?.length ?? 0;
}

// Các "phần" của từng kỹ năng có câu hỏi (Listening: parts, Reading: passages)
export const getSections = (quiz, skill) =>
    skill === "listening" ? quiz.listening.parts : skill === "reading" ? quiz.reading.passages : [];

// Đánh số liên tục qua mọi part/passage: Part 1 = 1–10, Part 2 = 11–20...
export function buildNumbering(sections) {
    const groupRanges = {};
    const sectionRanges = {};
    let next = 1;

    sections.forEach((section) => {
        const sectionStart = next;
        section.groups.forEach((group) => {
            const count = countGroupQuestions(group);
            groupRanges[group.id] = { start: next, end: next + count - 1, count };
            next += count;
        });
        sectionRanges[section.id] = { start: sectionStart, end: next - 1, count: next - sectionStart };
    });

    return { groupRanges, sectionRanges, total: next - 1 };
}

export const formatRange = (range) => {
    if (!range || range.count === 0) return "—";
    return range.start === range.end ? `${range.start}` : `${range.start}–${range.end}`;
};

// Group đã có đủ đáp án đúng chưa?
export function isGroupComplete(group) {
    const kind = getQuestionType(group.type).kind;
    if (kind === "mcq") {
        const filledOptions = group.options.filter((o) => o.text.trim()).length;
        return Boolean(group.question.trim()) && filledOptions >= 2 && group.correct.length === group.answersRequired;
    }
    if (!group.items?.length) return false;
    const itemsOk = group.items.every((item) => item.text.trim() && String(item.answer).trim());
    if (kind === "matching") return itemsOk && group.bank.some((b) => b.text.trim());
    return itemsOk;
}

export function isSectionComplete(section, skill) {
    const groupsOk = section.groups.length > 0 && section.groups.every(isGroupComplete);
    if (skill === "listening") return groupsOk && Boolean(section.audio?.url);
    if (skill === "reading") return groupsOk && section.paragraphs.some((p) => p.text.trim());
    return groupsOk;
}

export const isWritingTaskComplete = (task) =>
    Boolean(task.prompt.trim()) && (task.kind !== "report" || Boolean(task.chart?.url));

export const speakingPartStatus = (speaking) => ({
    part1: speaking.part1.questions.some((q) => q.text.trim()),
    part2: Boolean(speaking.part2.prompt.trim()) && speaking.part2.bullets.some((b) => b.text.trim()),
    part3: speaking.part3.questions.some((q) => q.text.trim())
});

// Tiến độ hiển thị trên tab: Listening 34/40, Writing 1/2...
export function skillProgress(quiz, skill) {
    const target = SKILLS.find((s) => s.key === skill).target;
    if (skill === "listening" || skill === "reading") {
        return { done: buildNumbering(getSections(quiz, skill)).total, target };
    }
    if (skill === "writing") {
        return { done: quiz.writing.tasks.filter(isWritingTaskComplete).length, target };
    }
    return { done: Object.values(speakingPartStatus(quiz.speaking)).filter(Boolean).length, target };
}

export const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

// Kiểm tra trước khi Publish: trả về danh sách vấn đề cần sửa
export function validateQuiz(quiz) {
    const issues = [];

    quiz.skills.forEach((skill) => {
        const label = SKILLS.find((s) => s.key === skill).label;

        if (skill === "listening" || skill === "reading") {
            const sections = getSections(quiz, skill);
            const { total } = buildNumbering(sections);
            if (total !== 40) issues.push(`${label}: has ${total} questions (IELTS uses 40).`);

            sections.forEach((section) => {
                if (skill === "listening" && !section.audio?.url) issues.push(`${label} · ${section.title}: no audio uploaded.`);
                if (skill === "reading" && !section.paragraphs.some((p) => p.text.trim())) {
                    issues.push(`${label} · ${section.title}: passage text is empty.`);
                }
                section.groups.forEach((group, i) => {
                    if (!isGroupComplete(group)) issues.push(`${label} · ${section.title} · Group ${i + 1}: missing text or correct answers.`);
                });
            });
        }

        if (skill === "writing") {
            quiz.writing.tasks.forEach((task) => {
                if (!task.prompt.trim()) issues.push(`${label} · ${task.title}: prompt is empty.`);
                if (task.kind === "report" && !task.chart?.url) issues.push(`${label} · ${task.title}: no chart uploaded.`);
            });
        }

        if (skill === "speaking") {
            const status = speakingPartStatus(quiz.speaking);
            if (!status.part1) issues.push(`${label} · Part 1: add at least one question.`);
            if (!status.part2) issues.push(`${label} · Part 2: cue card is incomplete.`);
            if (!status.part3) issues.push(`${label} · Part 3: add at least one question.`);
        }
    });

    return issues;
}
