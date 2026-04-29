"use client";

export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Habit Tracker
        </h1>
        <p className="text-primary-100 text-lg">Build better habits, every day</p>
        {/* Loading spinner */}
        <div className="mt-6">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
