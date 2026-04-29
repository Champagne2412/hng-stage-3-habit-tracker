"use client";

import { useState, FormEvent, useEffect } from "react";
import { validateHabitName } from "@/lib/validators";
import type { Habit } from "@/types/habit";

interface HabitFormProps {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  editingHabit?: Habit | null;
}

export default function HabitForm({ onSave, onCancel, editingHabit }: HabitFormProps) {
  const [name, setName] = useState(editingHabit?.name ?? "");
  const [description, setDescription] = useState(editingHabit?.description ?? "");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description);
    }
  }, [editingHabit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) {
      setNameError(result.error);
      return;
    }
    setNameError(null);
    onSave(result.value, description.trim());
  };

  return (
    <div
      data-testid="habit-form"
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        {editingHabit ? "Edit Habit" : "New Habit"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="habit-name"
            className="text-sm font-medium text-gray-700"
          >
            Habit name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="habit-name"
            type="text"
            data-testid="habit-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            placeholder="e.g. Drink Water"
            aria-describedby={nameError ? "habit-name-error" : undefined}
            aria-invalid={!!nameError}
            className={`px-4 py-2.5 rounded-lg border text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
              nameError
                ? "border-red-400 focus:ring-red-400 bg-red-50"
                : "border-gray-300 focus:border-primary-500"
            }`}
          />
          {nameError && (
            <p
              id="habit-name-error"
              role="alert"
              className="text-xs text-red-600"
            >
              {nameError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="habit-description"
            className="text-sm font-medium text-gray-700"
          >
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="habit-description"
            type="text"
            data-testid="habit-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Drink 8 glasses of water"
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="habit-frequency"
            className="text-sm font-medium text-gray-700"
          >
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            defaultValue="daily"
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition"
          >
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="habit-save-button"
            className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            {editingHabit ? "Save changes" : "Create habit"}
          </button>
        </div>
      </form>
    </div>
  );
}
