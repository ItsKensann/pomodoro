import type { Settings, Phase } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStart: false,
  soundOn: true,
  musicOn: false,
};

export const PHASE_LABEL: Record<Phase, string> = {
  work: "focus",
  shortBreak: "short break",
  longBreak: "long break",
};

export const PHASE_ACCENT: Record<Phase, string> = {
  work: "var(--color-pink)",
  shortBreak: "var(--color-cyan)",
  longBreak: "var(--color-moon)",
};

export function minutesForPhase(phase: Phase, settings: Settings): number {
  switch (phase) {
    case "work":
      return settings.workMinutes;
    case "shortBreak":
      return settings.shortBreakMinutes;
    case "longBreak":
      return settings.longBreakMinutes;
  }
}
