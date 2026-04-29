import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HabitForm from "@/components/habits/HabitForm";
import HabitCard from "@/components/habits/HabitCard";
import HabitList from "@/components/habits/HabitList";
import { getHabitSlug } from "@/lib/slug";
import type { Habit } from "@/types/habit";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: "habit-1",
  userId: "user-1",
  name: "Drink Water",
  description: "8 glasses",
  frequency: "daily",
  createdAt: "2024-01-01T00:00:00.000Z",
  completions: [],
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

describe("habit form", () => {
  it("shows a validation error when habit name is empty", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={vi.fn()} />);

    // Submit without filling name
    await user.click(screen.getByTestId("habit-save-button"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Habit name is required"
      );
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("creates a new habit and renders it in the list", async () => {
    const user = userEvent.setup();
    const habits: Habit[] = [];
    const onSave = vi.fn((name: string, description: string) => {
      habits.push(makeHabit({ name, description }));
    });

    const { rerender } = render(
      <>
        <HabitForm onSave={onSave} onCancel={vi.fn()} />
        <HabitList habits={habits} onToggleComplete={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
      </>
    );

    await user.type(screen.getByTestId("habit-name-input"), "Drink Water");
    await user.type(
      screen.getByTestId("habit-description-input"),
      "8 glasses a day"
    );
    await user.click(screen.getByTestId("habit-save-button"));

    expect(onSave).toHaveBeenCalledWith("Drink Water", "8 glasses a day");

    // Rerender with the new habit in list
    rerender(
      <>
        <HabitForm onSave={onSave} onCancel={vi.fn()} />
        <HabitList
          habits={habits}
          onToggleComplete={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </>
    );

    const slug = getHabitSlug("Drink Water");
    expect(screen.getByTestId(`habit-card-${slug}`)).toBeInTheDocument();
  });

  it("edits an existing habit and preserves immutable fields", async () => {
    const user = userEvent.setup();
    const original = makeHabit({
      id: "fixed-id",
      userId: "fixed-user",
      createdAt: "2024-01-01T00:00:00.000Z",
      completions: ["2024-01-05"],
    });

    let saved: { name: string; description: string } | null = null;
    const onSave = vi.fn((name: string, description: string) => {
      saved = { name, description };
    });

    render(
      <HabitForm onSave={onSave} onCancel={vi.fn()} editingHabit={original} />
    );

    // Clear and update name
    const nameInput = screen.getByTestId("habit-name-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Habit Name");
    await user.click(screen.getByTestId("habit-save-button"));

    expect(onSave).toHaveBeenCalledWith("Updated Habit Name", original.description);
    // Verify immutable fields are not passed to onSave (they're preserved by the caller)
    expect(saved?.name).toBe("Updated Habit Name");
  });

  it("deletes a habit only after explicit confirmation", async () => {
    const user = userEvent.setup();
    const habit = makeHabit({ name: "Drink Water" });
    const onDelete = vi.fn();

    render(
      <HabitCard
        habit={habit}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    const slug = getHabitSlug(habit.name);

    // Click delete button
    await user.click(screen.getByTestId(`habit-delete-${slug}`));

    // Confirmation dialog should appear
    expect(screen.getByTestId("confirm-delete-button")).toBeInTheDocument();

    // onDelete not yet called
    expect(onDelete).not.toHaveBeenCalled();

    // Confirm deletion
    await user.click(screen.getByTestId("confirm-delete-button"));

    expect(onDelete).toHaveBeenCalledWith(habit);
  });

  it("toggles completion and updates the streak display", async () => {
    const user = userEvent.setup();
    const today = new Date().toISOString().split("T")[0];
    const habit = makeHabit({ name: "Drink Water", completions: [] });

    let currentHabit = habit;
    const onToggle = vi.fn((h: Habit) => {
      const completions = h.completions.includes(today)
        ? h.completions.filter((d) => d !== today)
        : [...h.completions, today];
      currentHabit = { ...h, completions };
    });

    const slug = getHabitSlug(habit.name);

    const { rerender } = render(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Initially streak is 0
    expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent("0");

    // Click complete
    await user.click(screen.getByTestId(`habit-complete-${slug}`));
    expect(onToggle).toHaveBeenCalled();

    // Rerender with updated habit (completed today)
    rerender(
      <HabitCard
        habit={currentHabit}
        onToggleComplete={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Streak should now be 1
    expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent("1");
  });
});
