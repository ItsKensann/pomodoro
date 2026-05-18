# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. This is **Next 16**, not 13/14/15 — APIs, conventions, and file layout differ from older training-data examples. Before writing Next-specific code, consult `node_modules/next/dist/docs/` (see `AGENTS.md`).

Tailwind v4 uses CSS-based config via `@theme { … }` in `app/globals.css` — there is no `tailwind.config.{js,ts}`. Add palette tokens and font CSS vars there.

## Commands

```bash
npm run dev      # next dev — http://localhost:3000
npm run build    # next build
npm run start    # serve production build
npm run lint     # eslint (flat config in eslint.config.mjs; extends next core-web-vitals + typescript)
```

No test runner is configured.

Path alias: `@/*` → repo root (e.g. `@/hooks/useTimer`, `@/lib/types`).

## Architecture

Single-page client app. `app/page.tsx` is the only route — it composes `Starfield`, `AudioController`, `SettingsPanel`, `PomodoroTimer`, `TaskList`, and `Mascot`. State is plain React + custom hooks; **no external store** (no Redux, Zustand, etc.).

### Timer state machine (`hooks/useTimer.ts`)

The timer is **wall-clock anchored**, not interval-counted. While running, `endTimeRef` holds the absolute `Date.now()` deadline; a 250 ms `setInterval` only computes `endTime − now` to derive `remainingMs`. This is what makes the timer drift-free across tab backgrounding — do not refactor to a decrementing counter.

Phase progression lives in `nextPhaseAfter`: `work → shortBreak` normally, `work → longBreak` every `settings.longBreakInterval` completed work sessions. `skip()` advances without incrementing the work counter (intentional — skipping ≠ completing).

The latest `settings`, `phase`, `status`, `completedPomodoros`, and `onPhaseComplete` callback are mirrored into refs (`settingsRef`, `phaseRef`, etc.) so the tick callback and `advancePhase` stay stable and don't need to be re-created on every render.

### Persistence (`hooks/useLocalStorage.ts`)

Hydration-safe pattern: the hook returns `initialValue` for SSR + first client render, then swaps to the localStorage value in a mount `useEffect` and exposes a `hydrated` boolean. Don't read `localStorage` during render or at hook init — it breaks hydration.

Storage keys are versioned (`pomodoro.settings.v1`, `pomodoro.tasks.v1`); bump the suffix when changing the persisted shape.

### Audio (`components/AudioController.tsx`)

A context provider mounts two hidden `<audio>` elements once (`/audio/lofi-loop.mp3`, `/audio/chime.mp3`) and exposes `playChime()` via `useAudio()`. Lofi play/pause is driven declaratively by the `musicOn` prop. `play()` promise rejections (autoplay block, missing asset) are swallowed — audio is best-effort, missing files must not break the app.

Audio files are **not bundled**; users drop their own into `public/audio/`. See `public/audio/README.txt`.

### Styling

- Visual idiom is "Win98 beveled panel on a y2k night sky." Reuse `.bevel-out` / `.bevel-in` classes from `globals.css` rather than reinventing border styles.
- Two fonts via `next/font/google` in `app/layout.tsx`: Press Start 2P (pixel display, `font-pixel`) and VT323 (mono body, default).
- Per-phase accent color comes from `PHASE_ACCENT` in `lib/defaults.ts` (CSS var references, not raw hex).

## Conventions

- Client components only — every `.tsx` under `components/` and `hooks/` starts with `"use client"`. `app/page.tsx` is also a client component because it wires state through hooks.
- Types live in `lib/types.ts`; defaults and pure helpers in `lib/defaults.ts`. Add to these rather than colocating one-off types in component files.
- Keyboard shortcuts (`Space`, `R`) are handled inside `PomodoroTimer`; add new ones there, not in `page.tsx`.
