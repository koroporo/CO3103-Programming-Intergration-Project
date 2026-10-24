// ============================================================
// Lưu đề thi vào localStorage của trình duyệt (tạm thời, chưa có backend)
// Sau này chỉ cần thay các hàm bên dưới bằng lời gọi API là xong.
// ============================================================
import { createDemoQuiz, createEmptyQuiz } from "./quizDefaults";

const STORAGE_KEY = "ieltstrainer.quizzes.v1";

// File chọn từ máy (audio, ảnh chart) dùng URL dạng "blob:..." — chỉ sống trong phiên hiện tại.
// Ghi nhớ các URL tạo trong phiên này; URL cũ (từ lần tải trang trước) sẽ bị bỏ khi đọc lại.
const sessionBlobs = new Set();

export function createLocalFile(file) {
    const url = URL.createObjectURL(file);
    sessionBlobs.add(url);
    return { name: file.name, size: file.size, type: file.type, url };
}

function dropDeadFiles(value) {
    if (Array.isArray(value)) return value.map(dropDeadFiles);
    if (value && typeof value === "object") {
        if (typeof value.url === "string" && value.url.startsWith("blob:") && !sessionBlobs.has(value.url)) {
            return null;
        }
        const result = {};
        Object.keys(value).forEach((key) => {
            result[key] = dropDeadFiles(value[key]);
        });
        return result;
    }
    return value;
}

function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeAll(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return true;
    } catch {
        return false;
    }
}

// Lần đầu mở: tạo sẵn 1 đề mẫu
export function listQuizzes() {
    let list = readAll();
    if (!list) {
        list = [createDemoQuiz()];
        writeAll(list);
    }
    return list.map(dropDeadFiles).sort((a, b) => b.updatedAt - a.updatedAt);
}

export const getQuiz = (id) => listQuizzes().find((q) => q.id === id) ?? null;

// Trả về true nếu lưu thành công
export function saveQuiz(quiz) {
    const list = readAll() ?? [];
    const updated = { ...quiz, updatedAt: Date.now() };
    const index = list.findIndex((q) => q.id === quiz.id);
    if (index >= 0) list[index] = updated;
    else list.push(updated);
    return writeAll(list);
}

export function createQuiz(options) {
    const quiz = createEmptyQuiz(options);
    listQuizzes(); // đảm bảo đề mẫu đã được tạo trước
    saveQuiz(quiz);
    return quiz;
}

export function deleteQuiz(id) {
    const list = readAll() ?? [];
    writeAll(list.filter((q) => q.id !== id));
}
