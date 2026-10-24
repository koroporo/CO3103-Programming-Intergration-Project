// Danh sách group câu hỏi của 1 part/passage + nút thêm group (dùng chung cho Listening & Reading)
import React, { useState } from "react";
import { createGroup, uid } from "../../data/quizDefaults";
import QuestionGroup from "./QuestionGroup";
import QuestionTypePicker from "./QuestionTypePicker";
import { PlusIcon } from "./Icons";

// Copy sâu 1 group và tạo id mới cho mọi phần tử con
function cloneGroup(group) {
    const copy = JSON.parse(JSON.stringify(group));
    copy.id = uid();
    const idMap = {};
    ["options", "bank", "items"].forEach((key) => {
        if (!copy[key]) return;
        copy[key] = copy[key].map((it) => {
            const id = uid();
            idMap[it.id] = id;
            return { ...it, id };
        });
    });
    if (copy.correct) copy.correct = copy.correct.map((id) => idMap[id] ?? id);
    return copy;
}

export default function GroupList({ skill, groups, groupRanges, onChange }) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const replace = (id, next) => onChange(groups.map((g) => (g.id === id ? next : g)));
    const move = (from, to) => {
        const next = [...groups];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        onChange(next);
    };

    return (
        <div className="qe-group-list">
            {groups.length === 0 && (
                <div className="qe-empty">
                    <strong>No questions yet</strong>
                    <span>Add a question group to start numbering questions in this section.</span>
                </div>
            )}

            {groups.map((group, i) => (
                <QuestionGroup
                    key={group.id}
                    group={group}
                    index={i}
                    range={groupRanges[group.id]}
                    onChange={(next) => replace(group.id, next)}
                    onDelete={() => onChange(groups.filter((g) => g.id !== group.id))}
                    onDuplicate={() => {
                        const next = [...groups];
                        next.splice(i + 1, 0, cloneGroup(group));
                        onChange(next);
                    }}
                    onMoveUp={i > 0 ? () => move(i, i - 1) : null}
                    onMoveDown={i < groups.length - 1 ? () => move(i, i + 1) : null}
                />
            ))}

            <button className="qe-add-group" onClick={() => setPickerOpen(true)}>
                <PlusIcon /> Add question group
            </button>

            {pickerOpen && (
                <QuestionTypePicker
                    skill={skill}
                    onClose={() => setPickerOpen(false)}
                    onSelect={(typeId) => {
                        onChange([...groups, createGroup(typeId)]);
                        setPickerOpen(false);
                    }}
                />
            )}
        </div>
    );
}
