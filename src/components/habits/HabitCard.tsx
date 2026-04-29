"use client";

import { useState } from "react";
import { getHabitSlug } from "@/lib/slug";
import { calculateCurrentStreak } from "@/lib/streaks";
import type { Habit } from "@/types/habit";

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export default function HabitCard({
  habit,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const slug = getHabitSlug(habit.name);
  const today = new Date().toISOString().split("T")[0];
  const isCompletedToday = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  return (
    <>
      <div
        data-testid={`habit-card-${slug}`}
        className={`bg-white rounded-2xl border shadow-sm p-5 transition ${
          isCompletedToday
            ? "border-success-500 bg-success-100/30"
            : "border-gray-200 hover:border-primary-300"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: name + description + streak */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-base truncate ${
                isCompletedToday ? "text-success-600 line-through" : "text-gray-900"
              }`}
            >
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {habit.description}
              </p>
            )}
            <div
              data-testid={`habit-streak-${slug}`}
              className="flex items-center gap-1.5 mt-2"
              aria-label={`Current streak: ${streak} day${streak !== 1 ? "s" : ""}`}
            >
              {/* <span className="text-lg" aria-hidden="true"></span> */}
              <span className="text-sm font-semibold text-gray-700">
                {streak} day{streak !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-gray-400">streak</span>
            </div>
          </div>

          {/* Right: complete toggle + actions */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <button
              data-testid={`habit-complete-${slug}`}
              onClick={() => onToggleComplete(habit)}
              aria-label={
                isCompletedToday
                  ? `Unmark ${habit.name} as complete`
                  : `Mark ${habit.name} as complete`
              }
              aria-pressed={isCompletedToday}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                isCompletedToday
                  ? "bg-success-500 border-success-500 text-white"
                  : "border-gray-300 hover:border-success-500 text-transparent hover:text-success-500"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            <div className="flex gap-1">
              <button
                data-testid={`habit-edit-${slug}`}
                onClick={() => onEdit(habit)}
                aria-label={`Edit ${habit.name}`}
                className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                data-testid={`habit-delete-${slug}`}
                onClick={() => setShowConfirm(true)}
                aria-label={`Delete ${habit.name}`}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowConfirm(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2
              id="confirm-delete-title"
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              Delete habit?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-gray-700">{habit.name}</strong>? This
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Cancel
              </button>
              <button
                data-testid="confirm-delete-button"
                onClick={() => {
                  setShowConfirm(false);
                  onDelete(habit);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
