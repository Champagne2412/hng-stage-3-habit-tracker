import { describe, it, expect } from "vitest";
import { toggleHabitCompletion } from "@/lib/habits";
import type { Habit } from "@/types/habit";

const baseHabit: Habit = {
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "8 glasses",
  frequency: "daily",
  createdAt: "2024-01-01T00:00:00.000Z",
  completions: [],
};

describe("toggleHabitCompletion", () => {
  it("adds a completion date when the date is not present", () => {
    const result = toggleHabitCompletion(baseHabit, "2024-01-10");
    expect(result.completions).toContain("2024-01-10");
    expect(result.completions).toHaveLength(1);
  });

  it("removes a completion date when the date already exists", () => {
    const habit: Habit = { ...baseHabit, completions: ["2024-01-10"] };
    const result = toggleHabitCompletion(habit, "2024-01-10");
    expect(result.completions).not.toContain("2024-01-10");
    expect(result.completions).toHaveLength(0);
  });

  it("does not mutate the original habit object", () => {
    const habit: Habit = { ...baseHabit, completions: ["2024-01-09"] };
    const originalCompletions = [...habit.completions];
    toggleHabitCompletion(habit, "2024-01-10");
    expect(habit.completions).toEqual(originalCompletions);
  });

  it("does not return duplicate completion dates", () => {
    // Start with a duplicate already in the array
    const habit: Habit = {
      ...baseHabit,
      completions: ["2024-01-10", "2024-01-10"],
    };
    // Toggling off should remove all instances
    const result = toggleHabitCompletion(habit, "2024-01-10");
    expect(result.completions).not.toContain("2024-01-10");
    // Adding to a clean array should not produce duplicates
    const habit2: Habit = { ...baseHabit, completions: ["2024-01-09"] };
    const result2 = toggleHabitCompletion(habit2, "2024-01-09");
    // toggling existing removes it — no duplicate
    expect(result2.completions.filter((d) => d === "2024-01-09")).toHaveLength(0);
  });
});
