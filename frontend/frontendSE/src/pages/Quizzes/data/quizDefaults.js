// ============================================================
// Cấu hình chung + hàm tạo dữ liệu mặc định cho Quiz Editor
// ============================================================

export const uid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// 4 kỹ năng IELTS. target = số câu (Listening/Reading) hoặc số phần cần hoàn thành (Writing/Speaking)
export const SKILLS = [
    { key: "listening", label: "Listening", target: 40 },
    { key: "reading", label: "Reading", target: 40 },
    { key: "writing", label: "Writing", target: 2 },
    { key: "speaking", label: "Speaking", target: 3 }
];

// Số phần tối đa của mỗi kỹ năng (theo format IELTS Academic)
export const MAX_SECTIONS = { listening: 4, reading: 3 };

// Các dạng câu hỏi. "kind" quyết định giao diện soạn câu hỏi:
//   mcq        -> trắc nghiệm (1 hoặc nhiều đáp án)
//   judgement  -> True/False/Not Given, Yes/No/Not Given
//   matching   -> có "bank" lựa chọn + danh sách câu nối
//   completion -> điền từ vào chỗ trống
export const QUESTION_TYPES = [
    { id: "mcq-single", label: "Single answer MCQ", hint: "Choose one correct option", kind: "mcq", category: "Choice", skills: ["listening", "reading"] },
    { id: "mcq-multi", label: "Multiple answer MCQ", hint: "Choose two or more options", kind: "mcq", category: "Choice", skills: ["listening", "reading"] },
    { id: "tfng", label: "True / False / Not Given", hint: "Judge facts in the passage", kind: "judgement", category: "Choice", skills: ["reading"], choices: ["TRUE", "FALSE", "NOT GIVEN"] },
    { id: "ynng", label: "Yes / No / Not Given", hint: "Judge the writer's views", kind: "judgement", category: "Choice", skills: ["reading"], choices: ["YES", "NO", "NOT GIVEN"] },
    { id: "matching-headings", label: "Matching headings", hint: "Pick a heading for each paragraph", kind: "matching", category: "Matching", skills: ["reading"], bankStyle: "roman" },
    { id: "matching-information", label: "Matching information", hint: "Which paragraph contains it?", kind: "matching", category: "Matching", skills: ["reading"], bankStyle: "letter" },
    { id: "matching-features", label: "Matching features", hint: "Match statements to people or items", kind: "matching", category: "Matching", skills: ["listening", "reading"], bankStyle: "letter" },
    { id: "matching-endings", label: "Matching sentence endings", hint: "Complete each sentence start", kind: "matching", category: "Matching", skills: ["reading"], bankStyle: "letter" },
    { id: "sentence-completion", label: "Sentence completion", hint: "Fill the gap in each sentence", kind: "completion", category: "Completion", skills: ["listening", "reading"] },
    { id: "summary-completion", label: "Summary completion", hint: "Fill gaps in a summary", kind: "completion", category: "Completion", skills: ["listening", "reading"] },
    { id: "note-completion", label: "Note / form completion", hint: "Fill in notes or a form", kind: "completion", category: "Completion", skills: ["listening", "reading"] },
    { id: "table-completion", label: "Table completion", hint: "Fill cells in a table", kind: "completion", category: "Completion", skills: ["listening", "reading"] },
    { id: "flowchart-completion", label: "Flow-chart completion", hint: "Fill steps in a process", kind: "completion", category: "Completion", skills: ["listening", "reading"] },
    { id: "diagram-label", label: "Map / diagram labelling", hint: "Label parts of a map or diagram", kind: "completion", category: "Completion", skills: ["listening", "reading"] },
    { id: "short-answer", label: "Short answer", hint: "Answer in a few words", kind: "completion", category: "Completion", skills: ["listening", "reading"] }
];

export const getQuestionType = (typeId) =>
    QUESTION_TYPES.find((t) => t.id === typeId) ?? QUESTION_TYPES[0];

export const WORD_LIMITS = [
    "ONE WORD ONLY",
    "ONE WORD AND/OR A NUMBER",
    "NO MORE THAN TWO WORDS",
    "NO MORE THAN TWO WORDS AND/OR A NUMBER",
    "NO MORE THAN THREE WORDS"
];

// Nhãn A, B, C... hoặc i, ii, iii...
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv"];
export const bankLabel = (index, style) =>
    style === "roman" ? ROMAN[index] ?? String(index + 1) : String.fromCharCode(65 + index);

// ============================================================
// Hàm tạo dữ liệu trống
// ============================================================

export function createGroup(typeId) {
    const type = getQuestionType(typeId);
    const base = { id: uid(), type: type.id, collapsed: false };

    if (type.kind === "mcq") {
        const multi = type.id === "mcq-multi";
        return {
            ...base,
            instruction: multi ? "Choose TWO letters, A–E." : "Choose the correct letter, A, B, C or D.",
            question: "",
            answersRequired: multi ? 2 : 1,
            options: (multi ? ["", "", "", "", ""] : ["", "", "", ""]).map((text) => ({ id: uid(), text })),
            correct: [],
            explanation: "",
            evidence: ""
        };
    }

    if (type.kind === "judgement") {
        return {
            ...base,
            instruction: "Do the following statements agree with the information given in the passage?",
            items: [{ id: uid(), text: "", answer: "" }]
        };
    }

    if (type.kind === "matching") {
        return {
            ...base,
            instruction: type.bankStyle === "roman"
                ? "Choose the correct heading for each paragraph from the list of headings below."
                : "Match each statement with the correct option.",
            bank: [{ id: uid(), text: "" }, { id: uid(), text: "" }, { id: uid(), text: "" }],
            items: [{ id: uid(), text: "", answer: "" }]
        };
    }

    // completion
    return {
        ...base,
        instruction: "Complete the sentences below.",
        wordLimit: "NO MORE THAN TWO WORDS",
        items: [{ id: uid(), text: "", answer: "" }]
    };
}

export const createListeningPart = (n) => ({ id: uid(), title: `Part ${n}`, audio: null, groups: [] });

export const createPassage = (n) => ({
    id: uid(),
    title: `Passage ${n}`,
    heading: "",
    paragraphs: [{ id: uid(), text: "" }],
    groups: []
});

export const createWritingTasks = () => [
    {
        id: uid(),
        kind: "report",
        title: "Task 1 · Academic report",
        prompt: "",
        chart: null,
        altText: "",
        minWords: 150,
        time: "20 minutes",
        sample: "",
        grading: ""
    },
    {
        id: uid(),
        kind: "essay",
        title: "Task 2 · Essay",
        prompt: "",
        chart: null,
        altText: "",
        minWords: 250,
        time: "40 minutes",
        sample: "",
        grading: ""
    }
];

export const createSpeaking = () => ({
    part1: { topic: "", questions: [{ id: uid(), text: "" }] },
    part2: {
        prompt: "",
        bullets: [{ id: uid(), text: "" }, { id: uid(), text: "" }, { id: uid(), text: "" }],
        prepSeconds: 60,
        speakMinutes: 2,
        audio: null,
        followUp: ""
    },
    part3: { topic: "", questions: [{ id: uid(), text: "" }] }
});

export function createEmptyQuiz({ title, skills }) {
    return {
        id: uid(),
        title: title?.trim() || "Untitled IELTS test",
        testType: "Academic · Full Test",
        status: "draft",
        skills: skills?.length ? skills : SKILLS.map((s) => s.key),
        updatedAt: Date.now(),
        listening: {
            settings: { timeLimit: "30 minutes", bandTarget: "6.5–7.5", shuffle: false },
            parts: [1, 2, 3, 4].map(createListeningPart)
        },
        reading: {
            settings: { timeLimit: "60 minutes", bandTarget: "6.5–7.5" },
            passages: [1, 2, 3].map(createPassage)
        },
        writing: {
            settings: { timeLimit: "60 minutes", bandTarget: "6.5–7.5" },
            tasks: createWritingTasks()
        },
        speaking: {
            settings: { timeLimit: "11–14 minutes", bandTarget: "6.5–7.5" },
            ...createSpeaking()
        }
    };
}

// ============================================================
// Đề mẫu lấy nội dung từ wireframe, để Quiz Manager không trống
// ============================================================
export function createDemoQuiz() {
    const quiz = createEmptyQuiz({ title: "IELTS Academic Mock Test – 01" });

    // ---------- Listening: Part 2 ----------
    const mcq = createGroup("mcq-multi");
    mcq.instruction = "Choose the correct answer and write it in the numbered field.";
    mcq.question = "Which TWO benefits are mentioned by the researcher?";
    mcq.options = ["Lower maintenance costs", "Faster recovery after floods", "Higher commercial rents", "Reduced travel times"]
        .map((text) => ({ id: uid(), text }));
    mcq.correct = [mcq.options[0].id, mcq.options[1].id];
    mcq.explanation = "Both benefits are stated directly by the researcher.";
    mcq.evidence = "Paragraph B";

    const notes = createGroup("note-completion");
    notes.instruction = "Complete the notes below.";
    notes.wordLimit = "ONE WORD AND/OR A NUMBER";
    notes.items = [
        { id: uid(), text: "Park opened in ___", answer: "2019" },
        { id: uid(), text: "Main material used for paths: ___", answer: "gravel" },
        { id: uid(), text: "Number of rain gardens: ___", answer: "12" }
    ];
    quiz.listening.parts[1].groups = [mcq, notes];

    // ---------- Reading: Passage 2 ----------
    const passage = quiz.reading.passages[1];
    passage.heading = "How cities learn to live with water";
    passage.paragraphs = [
        "For generations, urban planners treated water as something to remove quickly. Newer projects take the opposite approach: they slow rainfall down and create spaces where it can collect safely.",
        "In one coastal district, a chain of parks becomes a temporary reservoir during heavy storms. On dry days, the same landscape provides shaded routes, play areas and habitats for birds.",
        "Researchers caution that no single design can eliminate flood risk. However, local evidence suggests that combining permeable streets, wetlands and early warnings can reduce both damage and recovery time."
    ].map((text) => ({ id: uid(), text }));

    const headings = createGroup("matching-headings");
    headings.bank = ["A shift in priorities", "Limits of one solution", "A park with two purposes"]
        .map((text) => ({ id: uid(), text }));
    headings.items = [
        { id: uid(), text: "Paragraph A", answer: "i" },
        { id: uid(), text: "Paragraph B", answer: "iii" },
        { id: uid(), text: "Paragraph C", answer: "ii" }
    ];

    const sentences = createGroup("sentence-completion");
    sentences.wordLimit = "NO MORE THAN TWO WORDS";
    sentences.items = [
        { id: uid(), text: "During storms, the parks act as a temporary ___.", answer: "reservoir" },
        { id: uid(), text: "Experts say flood risk cannot be removed by a single ___.", answer: "design" }
    ];
    passage.groups = [headings, sentences];

    // ---------- Writing ----------
    const [task1, task2] = quiz.writing.tasks;
    task1.prompt = "The chart below shows the percentage of commuters using four forms of transport in a city in 2005 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";
    task1.altText = "Grouped bar chart comparing car, bus, bicycle and rail use in 2005 and 2025.";
    task1.sample = "Overall, private car use declined while rail and bicycle travel became more common. The largest change was recorded for rail…";
    task1.grading = "Reward a clear overview, accurate comparisons, and appropriate data selection. Do not require every figure.";
    task2.prompt = "Some people believe that cities should invest more in public parks than in new roads. To what extent do you agree or disagree?";

    // ---------- Speaking ----------
    const sp = quiz.speaking;
    sp.part1 = {
        topic: "Home and neighbourhood",
        questions: [
            "What kind of place do you live in?",
            "What do you like most about your neighbourhood?",
            "Has your neighbourhood changed in recent years?",
            "Would you like to live there in the future?"
        ].map((text) => ({ id: uid(), text }))
    };
    sp.part2 = {
        ...sp.part2,
        prompt: "Describe a public place you enjoy visiting.",
        bullets: [
            "where the place is",
            "what you do there",
            "who you usually go with",
            "and explain why you enjoy visiting it"
        ].map((text) => ({ id: uid(), text })),
        followUp: "Would you recommend this place to visitors? Why?"
    };
    sp.part3 = {
        topic: "Public places",
        questions: [
            "Why are public places important in cities?",
            "How can local governments make parks more inclusive?",
            "Do people use public spaces differently now than in the past?",
            "Who should pay for maintaining shared spaces?"
        ].map((text) => ({ id: uid(), text }))
    };

    return quiz;
}
