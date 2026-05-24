# ♪ lofi.pomodoro ♪

A pixel y2k pomodoro app for nighttime study sessions. Built with Next.js 16.2.6 (App Router), TypeScript, and Tailwind v4.

## Features

- **Pomodoro timer** with focus / short break / long break phases
  - Drift-free wall-clock timing — survives tab backgrounding accurately
  - Auto-advance between phases (optional)
  - Skip phase, reset, pause/resume
- **Task list** — add, check, delete; persists to localStorage
- **Custom durations** — tweak each phase length and long-break interval
- **Optional chime** - local session-end sound
- **Nighttime y2k aesthetic** — pixel font, Win98-style window panels, animated starfield, sleeping pixel cat mascot
- **Keyboard shortcuts** — `Space` to start/pause, `R` to reset

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Audio

The app can use one optional local file in `public/audio/`:

- `chime.mp3` - short chime played at session end

If `chime.mp3` is missing, chime playback is silently skipped.

## Tech notes

- **Tailwind v4** with CSS-based `@theme` in `app/globals.css`
- **Fonts** via `next/font/google` — Press Start 2P (display) + VT323 (body)
- **State** is plain React + custom hooks; no external store
- **Persistence** is localStorage with hydration-safe reads

## Project structure

```
app/
  layout.tsx          fonts, metadata
  page.tsx            wires together everything
  globals.css         tailwind + palette tokens
components/
  Window.tsx          beveled y2k window chrome
  PixelButton.tsx     chunky pixel button
  PomodoroTimer.tsx   timer UI
  TaskList.tsx        task UI
  SettingsPanel.tsx   settings UI
  Starfield.tsx       animated nighttime background
  Mascot.tsx          sleeping pixel cat (SVG)
  AudioController.tsx audio context + chime player
hooks/
  useTimer.ts         drift-free timer state machine
  useLocalStorage.ts  hydration-safe persisted state
  useTasks.ts         task CRUD
lib/
  types.ts            Phase, Settings, Task
  defaults.ts         DEFAULT_SETTINGS, phase helpers
```
