import { useState } from "react";
import { motion } from "framer-motion";
import { ATTRIBUTE_META } from "../lib/attributes.js";
import { AttributeIcon } from "./Icons.jsx";

const DIFFICULTY_STYLES = {
  easy: "bg-moss-soft text-moss border border-moss/20",
  medium: "bg-indigo-soft text-indigo border border-indigo/20",
  hard: "bg-amber-soft text-amber border border-amber/20",
  epic: "bg-clay-soft text-clay border border-clay/20",
};

const DIFFICULTY_BORDERS = {
  easy: "border-l-emerald-500",
  medium: "border-l-indigo-500",
  hard: "border-l-amber-500",
  epic: "border-l-rose-500",
};

const DIFFICULTY_REWARDS = {
  easy: "+15 XP • 5g",
  medium: "+35 XP • 12g",
  hard: "+70 XP • 25g",
  epic: "+140 XP • 55g",
};

const DIFFICULTIES = ["easy", "medium", "hard", "epic"];

export default function TaskCard({ task, onComplete, onUpdate, onDelete, completing }) {
  const isDone = task.status === "completed";
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || "");
  const [editAttribute, setEditAttribute] = useState(task.attribute);
  const [editDifficulty, setEditDifficulty] = useState(task.difficulty);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!editTitle.trim() || !onUpdate) return;
    setSaving(true);
    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        notes: editNotes,
        attribute: editAttribute,
        difficulty: editDifficulty,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditTitle(task.title);
    setEditNotes(task.notes || "");
    setEditAttribute(task.attribute);
    setEditDifficulty(task.difficulty);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <motion.li
        layout
        className="rpg-glass border border-indigo/40 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-sm"
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-mute mb-1 block">Quest Title</label>
            <input
              type="text"
              required
              maxLength={140}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border border-hairline rounded-lg px-3 py-2 text-sm bg-paper text-ink focus:border-indigo"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-mute mb-1 block">Notes / Objectives (optional)</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="E.g. Chapter 4-5, focus on dynamic programming"
              className="w-full border border-hairline rounded-lg px-3 py-2 text-sm bg-paper text-ink focus:border-indigo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-mute mb-1 block">RPG Attribute</label>
              <select
                value={editAttribute}
                onChange={(e) => setEditAttribute(e.target.value)}
                className="w-full border border-hairline rounded-lg px-2.5 py-2 text-xs bg-paper text-ink"
              >
                {Object.entries(ATTRIBUTE_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-mute mb-1 block">Difficulty Bounty</label>
              <select
                value={editDifficulty}
                onChange={(e) => setEditDifficulty(e.target.value)}
                className="w-full border border-hairline rounded-lg px-2.5 py-2 text-xs bg-paper text-ink"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d[0].toUpperCase() + d.slice(1)} ({DIFFICULTY_REWARDS[d]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs px-3.5 py-1.5 rounded-lg border border-hairline text-mute hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !editTitle.trim()}
              className="text-xs px-4 py-1.5 rounded-lg bg-ink text-paper font-medium disabled:opacity-60 shadow-xs"
            >
              {saving ? "Saving…" : "Save Quest"}
            </button>
          </div>
        </form>
      </motion.li>
    );
  }

  const borderClass = DIFFICULTY_BORDERS[task.difficulty] || "border-l-hairline";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`border border-hairline border-l-4 ${borderClass} rounded-xl p-4 flex items-start gap-3.5 bg-surface/90 hover:shadow-xs transition-all ${
        isDone ? "opacity-75 bg-paper/60" : "hover:-translate-y-0.5"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => !isDone && onComplete(task)}
        disabled={isDone || completing}
        aria-label={isDone ? `${task.title} — completed` : `Complete quest: ${task.title}`}
        className={`mt-0.5 h-5 w-5 rounded-md border shrink-0 flex items-center justify-center transition-all ${
          isDone
            ? "bg-moss border-moss text-paper shadow-xs"
            : "border-hairline hover:border-ink bg-paper"
        }`}
      >
        {isDone && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
            <path
              d="M2 6.5L4.5 9L10 3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Quest Details */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isDone ? "line-through text-mute" : "text-ink"
          }`}
        >
          {task.title}
        </p>

        {task.notes && (
          <p className="text-xs text-mute mt-0.5 line-clamp-2">{task.notes}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {/* Difficulty Badge */}
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[task.difficulty]}`}
          >
            {task.difficulty}
          </span>

          {/* Reward Bounty */}
          <span className="text-[11px] text-mute font-normal">
            {DIFFICULTY_REWARDS[task.difficulty]}
          </span>

          <span className="text-hairline">•</span>

          {/* Attribute Tag */}
          <span className="text-[11px] text-mute flex items-center gap-1.5">
            <AttributeIcon name={task.attribute} className="w-3.5 h-3.5 text-mute" />
            <span>{ATTRIBUTE_META[task.attribute]?.label}</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="flex items-center gap-1.5 shrink-0">
          {onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              aria-label={`Edit quest: ${task.title}`}
              className="text-mute hover:text-indigo text-xs px-2 py-1 rounded-md hover:bg-paper transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task)}
              aria-label={`Delete quest: ${task.title}`}
              className="text-mute hover:text-clay text-xs px-2 py-1 rounded-md hover:bg-paper transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </motion.li>
  );
}

/* commit_stage_36_ayush */
