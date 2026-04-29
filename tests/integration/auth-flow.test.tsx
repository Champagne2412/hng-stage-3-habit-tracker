import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { getSession, getUsers } from "@/lib/storage";

// Mock router
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  mockReplace.mockClear();
});

describe("auth flow", () => {
  it("submits the signup form and creates a session", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(
      screen.getByTestId("auth-signup-email"),
      "test@example.com"
    );
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      // User was created in localStorage
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("test@example.com");

      // Session was created
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session?.email).toBe("test@example.com");

      // Redirected to dashboard
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error for duplicate signup email", async () => {
    const user = userEvent.setup();

    // Create existing user
    localStorage.setItem(
      "habit-tracker-users",
      JSON.stringify([
        {
          id: "1",
          email: "existing@example.com",
          password: "pass",
          createdAt: new Date().toISOString(),
        },
      ])
    );

    render(<SignupForm />);

    await user.type(
      screen.getByTestId("auth-signup-email"),
      "existing@example.com"
    );
    await user.type(screen.getByTestId("auth-signup-password"), "password123");
    await user.click(screen.getByTestId("auth-signup-submit"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("User already exists");
    });
  });

  it("submits the login form and stores the active session", async () => {
    const user = userEvent.setup();

    // Seed a user
    localStorage.setItem(
      "habit-tracker-users",
      JSON.stringify([
        {
          id: "user-123",
          email: "login@example.com",
          password: "mypassword",
          createdAt: new Date().toISOString(),
        },
      ])
    );

    render(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "login@example.com"
    );
    await user.type(screen.getByTestId("auth-login-password"), "mypassword");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe("user-123");
      expect(session?.email).toBe("login@example.com");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error for invalid login credentials", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByTestId("auth-login-email"),
      "nobody@example.com"
    );
    await user.type(screen.getByTestId("auth-login-password"), "wrongpass");
    await user.click(screen.getByTestId("auth-login-submit"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid email or password"
      );
    });
  });
});
