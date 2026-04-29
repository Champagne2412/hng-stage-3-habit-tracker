import { describe, it, expect } from "vitest";
import { validateHabitName } from "@/lib/validators";

describe("validateHabitName", () => {
  it("returns an error when habit name is empty", () => {
    expect(validateHabitName("")).toEqual({
      valid: false,
      value: "",
      error: "Habit name is required",
    });
    expect(validateHabitName("   ")).toEqual({
      valid: false,
      value: "",
      error: "Habit name is required",
    });
  });

  it("returns an error when habit name exceeds 60 characters", () => {
    const longName = "a".repeat(61);
    const result = validateHabitName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Habit name must be 60 characters or fewer");
  });

  it("returns a trimmed value when habit name is valid", () => {
    expect(validateHabitName("Drink Water")).toEqual({
      valid: true,
      value: "Drink Water",
      error: null,
    });
    expect(validateHabitName("  Drink Water  ")).toEqual({
      valid: true,
      value: "Drink Water",
      error: null,
    });
    // Exactly 60 characters is valid
    const exactly60 = "a".repeat(60);
    const result = validateHabitName(exactly60);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.value).toBe(exactly60);
  });
});
