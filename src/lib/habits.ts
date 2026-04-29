import type { Habit } from "@/types/habit";

/**
 * Toggles a date in habit.completions.
 * - Adds date if not present
 * - Removes date if already present
 * - Does not mutate the original habit
 * - Does not allow duplicate dates
 */
export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = Array.from(new Set(habit.completions));

  const index = completions.indexOf(date);
  let updated: string[];

  if (index === -1) {
    updated = [...completions, date];
  } else {
    updated = completions.filter((d) => d !== date);
  }

  return { ...habit, completions: updated };
}
