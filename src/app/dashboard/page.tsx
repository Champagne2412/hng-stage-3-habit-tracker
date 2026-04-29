"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  clearSession,
  getHabitsByUser,
  createHabit,
  updateHabit,
  deleteHabit,
} from "@/lib/storage";
import { toggleHabitCompletion } from "@/lib/habits";
import HabitList from "@/components/habits/HabitList";
import HabitForm from "@/components/habits/HabitForm";
import type { Habit } from "@/types/habit";
import type { Session } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setHabits(getHabitsByUser(s.userId));
    setReady(true);
  }, [router]);

  const refreshHabits = useCallback((userId: string) => {
    setHabits(getHabitsByUser(userId));
  }, []);

  const handleSave = (name: string, description: string) => {
    if (!session) return;

    if (editingHabit) {
      const updated: Habit = {
        ...editingHabit,
        name,
        description,
      };
      updateHabit(updated);
    } else {
      createHabit(session.userId, name, description);
    }

    refreshHabits(session.userId);
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleToggleComplete = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = toggleHabitCompletion(habit, today);
    updateHabit(updated);
    if (session) refreshHabits(session.userId);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleDelete = (habit: Habit) => {
    deleteHabit(habit.id);
    if (session) refreshHabits(session.userId);
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  if (!ready) return null;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const completedToday = habits.filter((h) =>
    h.completions.includes(new Date().toISOString().split("T")[0])
  ).length;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Habit Tracker</h1>
            <p className="text-xs text-gray-400">{today}</p>
          </div>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-600 transition px-3 py-1.5 rounded-lg hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Today&apos;s progress
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {completedToday}
              <span className="text-gray-400 font-normal text-lg">
                /{habits.length}
              </span>
            </p>
          </div>
          {habits.length > 0 && (
            <div className="w-14 h-14 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${(completedToday / habits.length) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                {habits.length > 0
                  ? Math.round((completedToday / habits.length) * 100)
                  : 0}%
              </span>
            </div>
          )}
        </div>

        {/* Create button or form */}
        {showForm ? (
          <div className="mb-6">
            <HabitForm
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingHabit(null);
              }}
              editingHabit={editingHabit}
            />
          </div>
        ) : (
          <button
            data-testid="create-habit-button"
            onClick={() => {
              setEditingHabit(null);
              setShowForm(true);
            }}
            className="w-full mb-6 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl text-sm transition flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Habit
          </button>
        )}

        {/* Habits */}
        <HabitList
          habits={habits}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
