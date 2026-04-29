"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getUserByEmail, createUser, saveSession } from "@/lib/storage";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim();

    // Check for duplicate
    const existing = getUserByEmail(trimmedEmail);
    if (existing) {
      setError("User already exists");
      setLoading(false);
      return;
    }

    if (!trimmedEmail || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const user = createUser(trimmedEmail, password);
    saveSession({ userId: user.id, email: user.email });
    router.replace("/dashboard");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      noValidate
      aria-label="Signup form"
    >
      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-email"
          className="text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          data-testid="auth-signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="signup-password"
          className="text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          data-testid="auth-signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
        />
      </div>

      <button
        type="submit"
        data-testid="auth-signup-submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
