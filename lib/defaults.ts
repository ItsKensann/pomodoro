import type { Settings, Phase } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStart: false,
  soundOn: true,
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

function readNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeSettings(value: unknown): Settings {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;

  const saved = value as Record<string, unknown>;

  return {
    workMinutes: readNumber(
      saved.workMinutes,
      DEFAULT_SETTINGS.workMinutes,
      1,
      180,
    ),
    shortBreakMinutes: readNumber(
      saved.shortBreakMinutes,
      DEFAULT_SETTINGS.shortBreakMinutes,
      1,
      60,
    ),
    longBreakMinutes: readNumber(
      saved.longBreakMinutes,
      DEFAULT_SETTINGS.longBreakMinutes,
      1,
      60,
    ),
    longBreakInterval: readNumber(
      saved.longBreakInterval,
      DEFAULT_SETTINGS.longBreakInterval,
      2,
      10,
    ),
    autoStart: readBoolean(saved.autoStart, DEFAULT_SETTINGS.autoStart),
    soundOn: readBoolean(saved.soundOn, DEFAULT_SETTINGS.soundOn),
  };
}
