"use client";

import HabitCard from "./HabitCard";
import type { Habit } from "@/types/habit";

interface HabitListProps {
  habits: Habit[];
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export default function HabitList({
  habits,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No habits yet
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Create your first habit to start building your streaks.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Habit list">
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitCard
            habit={habit}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
