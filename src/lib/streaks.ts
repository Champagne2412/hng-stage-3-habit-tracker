/**
 * Calculates the current streak from an array of completion dates.
 * - completions: YYYY-MM-DD strings
 * - today: optional override (defaults to current date)
 * - deduplicates and sorts before calculating
 * - if today is not completed, streak is 0
 * - if today is completed, counts consecutive calendar days backwards
 */
export function calculateCurrentStreak(
  completions: string[],
  today?: string
): number {
  const todayStr = today ?? new Date().toISOString().split("T")[0];

  // Deduplicate
  const unique = Array.from(new Set(completions));

  // Sort ascending
  unique.sort();

  if (!unique.includes(todayStr)) {
    return 0;
  }

  let streak = 0;
  let current = new Date(todayStr);

  while (true) {
    const dateStr = current.toISOString().split("T")[0];
    if (unique.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
