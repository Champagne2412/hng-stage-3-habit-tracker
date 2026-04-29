import { describe, it, expect } from "vitest";
import { calculateCurrentStreak } from "@/lib/streaks";

/* MENTOR_TRACE_STAGE3_HABIT_A91 */
describe("calculateCurrentStreak", () => {
  it("returns 0 when completions is empty", () => {
    expect(calculateCurrentStreak([], "2024-01-10")).toBe(0);
  });

  it("returns 0 when today is not completed", () => {
    // Only yesterday is completed, not today
    expect(calculateCurrentStreak(["2024-01-09"], "2024-01-10")).toBe(0);
    expect(calculateCurrentStreak(["2024-01-08", "2024-01-09"], "2024-01-10")).toBe(0);
  });

  it("returns the correct streak for consecutive completed days", () => {
    // Just today = streak of 1
    expect(calculateCurrentStreak(["2024-01-10"], "2024-01-10")).toBe(1);
    // Today and yesterday = streak of 2
    expect(
      calculateCurrentStreak(["2024-01-09", "2024-01-10"], "2024-01-10")
    ).toBe(2);
    // Three consecutive days
    expect(
      calculateCurrentStreak(
        ["2024-01-08", "2024-01-09", "2024-01-10"],
        "2024-01-10"
      )
    ).toBe(3);
  });

  it("ignores duplicate completion dates", () => {
    expect(
      calculateCurrentStreak(
        ["2024-01-10", "2024-01-10", "2024-01-09", "2024-01-09"],
        "2024-01-10"
      )
    ).toBe(2);
  });

  it("breaks the streak when a calendar day is missing", () => {
    // Today + two days ago (yesterday missing) = streak of 1
    expect(
      calculateCurrentStreak(["2024-01-08", "2024-01-10"], "2024-01-10")
    ).toBe(1);
    // Longer gap
    expect(
      calculateCurrentStreak(
        ["2024-01-05", "2024-01-06", "2024-01-10"],
        "2024-01-10"
      )
    ).toBe(1);
  });
});
