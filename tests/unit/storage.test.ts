import { describe, it, expect, beforeEach } from "vitest";
import {
  getUsers, createUser, getUserByEmail,
  getSession, saveSession, clearSession,
  getHabits, createHabit, updateHabit, deleteHabit, getHabitsByUser,
} from "../../src/lib/storage";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("creates and retrieves a user", () => {
    const user = createUser("test@example.com", "pass123");
    expect(user.email).toBe("test@example.com");
    expect(getUsers()).toHaveLength(1);
  });

  it("finds a user by email", () => {
    createUser("find@example.com", "pass");
    expect(getUserByEmail("find@example.com")).toBeDefined();
    expect(getUserByEmail("missing@example.com")).toBeUndefined();
  });

  it("saves and retrieves a session", () => {
    saveSession({ userId: "u1", email: "a@b.com" });
    expect(getSession()).toEqual({ userId: "u1", email: "a@b.com" });
  });

  it("clears the session", () => {
    saveSession({ userId: "u1", email: "a@b.com" });
    clearSession();
    expect(getSession()).toBeNull();
  });

  it("creates and retrieves habits", () => {
    const habit = createHabit("u1", "Drink Water", "8 glasses");
    expect(getHabits()).toHaveLength(1);
    expect(habit.name).toBe("Drink Water");
  });

  it("filters habits by user", () => {
    createHabit("u1", "Habit A", "");
    createHabit("u2", "Habit B", "");
    expect(getHabitsByUser("u1")).toHaveLength(1);
  });

  it("updates a habit", () => {
    const habit = createHabit("u1", "Old Name", "");
    updateHabit({ ...habit, name: "New Name" });
    expect(getHabits()[0].name).toBe("New Name");
  });

  it("deletes a habit", () => {
    const habit = createHabit("u1", "To Delete", "");
    deleteHabit(habit.id);
    expect(getHabits()).toHaveLength(0);
  });
});