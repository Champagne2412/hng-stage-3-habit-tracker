# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits. Built with Next.js 14 (App Router), React, TypeScript, and Tailwind CSS.

---

## Project Overview

Habit Tracker allows users to:
- Sign up and log in with email/password (local auth, no remote service)
- Create, edit, and delete daily habits
- Mark habits complete for today and track streaks
- View per-user habits (data is scoped to the logged-in user)
- Install as a PWA and use offline after initial load
- Persist all state locally via `localStorage`

---

## Setup Instructions

**Prerequisites:** Node.js 18+, npm 9+

```bash
# Clone the repo
git clone <your-repo-url>
cd habit-tracker

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install --with-deps chromium
```

---

## Run Instructions

```bash
# Development server
npm run dev
# Open http://localhost:3000

# Production build + start
npm run build
npm run start
```

---

## Test Instructions

```bash
# Unit tests (with coverage report)
npm run test:unit

# Integration/component tests
npm run test:integration

# End-to-end tests (requires built app running on :3000)
npm run build && npm run start &
npm run test:e2e

# All tests
npm test
```

Coverage report is generated at `coverage/` after running `test:unit`.

---

## Local Persistence Structure

All persistence uses `localStorage`. Three keys are used:

| Key | Type | Purpose |
|-----|------|---------|
| `habit-tracker-users` | `User[]` JSON array | All registered users |
| `habit-tracker-session` | `Session` JSON object or `"null"` | Active session |
| `habit-tracker-habits` | `Habit[]` JSON array | All habits (filtered by `userId` on read) |

**User shape:**
```ts
{ id: string; email: string; password: string; createdAt: string }
```

**Session shape:**
```ts
{ userId: string; email: string } | null
```

**Habit shape:**
```ts
{
  id: string; userId: string; name: string; description: string;
  frequency: 'daily'; createdAt: string; completions: string[] // YYYY-MM-DD
}
```

---

## PWA Support

- `public/manifest.json` — includes name, short_name, start_url, display, theme/background colors, and 192/512 icons
- `public/sw.js` — service worker using cache-first strategy for the app shell
- `src/components/shared/ServiceWorkerRegistration.tsx` — registers the SW on the client via `useEffect`
- Icons at `public/icons/icon-192.png` and `public/icons/icon-512.png`

The service worker caches the app shell on install and serves it offline after first load.

---

## Trade-offs and Limitations

- **Passwords are stored in plaintext** in localStorage. This is intentional per the TRD ("front-end-focused, no remote auth service"). Do not use real passwords.
- **No encryption** of localStorage data — this is acceptable for a local-only demo app.
- **Single device only** — data does not sync across devices.
- **Daily frequency only** — the TRD specifies only `'daily'` is required for this stage.
- **E2E offline test** uses `context.setOffline(true)` which simulates network loss. Service worker caching depends on the browser having loaded the app at least once.

---

## Test File Map

| File | Describe block | What it verifies |
|------|---------------|-----------------|
| `tests/unit/slug.test.ts` | `getHabitSlug` | Slug generation: lowercase, hyphenation, trimming, special char removal |
| `tests/unit/validators.test.ts` | `validateHabitName` | Empty name rejection, 60-char limit, trimmed valid output |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` | Streak counting: empty, no today, consecutive days, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` | Add/remove completion dates, immutability, no duplicates |
| `tests/integration/auth-flow.test.tsx` | `auth flow` | Signup creates user+session, duplicate email error, login stores session, invalid credentials error |
| `tests/integration/habit-form.test.tsx` | `habit form` | Validation error, create+render, edit preserves immutable fields, delete confirmation, completion toggle+streak update |
| `tests/e2e/app.spec.ts` | `Habit Tracker app` | Full user journeys: splash, redirects, auth, CRUD, persistence, logout, offline |

---

## Required File Structure

```
src/
  app/
    page.tsx              ← / (splash + redirect)
    login/page.tsx        ← /login
    signup/page.tsx       ← /signup
    dashboard/page.tsx    ← /dashboard (protected)
    layout.tsx
    globals.css
  components/
    auth/
      LoginForm.tsx
      SignupForm.tsx
    habits/
      HabitCard.tsx
      HabitForm.tsx
      HabitList.tsx
    shared/
      SplashScreen.tsx
      ServiceWorkerRegistration.tsx
  lib/
    slug.ts
    validators.ts
    streaks.ts
    habits.ts
    storage.ts
  types/
    auth.ts
    habit.ts
tests/
  unit/
    slug.test.ts
    validators.test.ts
    streaks.test.ts
    habits.test.ts
  integration/
    auth-flow.test.tsx
    habit-form.test.tsx
  e2e/
    app.spec.ts
  setup.ts
public/
  manifest.json
  sw.js
  icons/
    icon-192.png
    icon-512.png
```
