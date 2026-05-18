"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Phase, Settings, TimerStatus } from "@/lib/types";
import { minutesForPhase } from "@/lib/defaults";

const TICK_MS = 250;

interface UseTimerOptions {
  onPhaseComplete?: (finishedPhase: Phase, nextPhase: Phase) => void;
}

export interface UseTimerReturn {
  phase: Phase;
  status: TimerStatus;
  remainingMs: number;
  totalMs: number;
  completedPomodoros: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  setPhase: (phase: Phase) => void;
}

function nextPhaseAfter(
  finished: Phase,
  completedWorkSessions: number,
  longBreakInterval: number,
): Phase {
  if (finished === "work") {
    return completedWorkSessions > 0 &&
      completedWorkSessions % longBreakInterval === 0
      ? "longBreak"
      : "shortBreak";
  }
  return "work";
}

export function useTimer(
  settings: Settings,
  options: UseTimerOptions = {},
): UseTimerReturn {
  const [phase, setPhaseState] = useState<Phase>("work");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Wall-clock anchor: when running, the moment the timer hits zero.
  const endTimeRef = useRef<number | null>(null);
  // When paused/idle, the displayed remaining.
  const [remainingMs, setRemainingMs] = useState<number>(
    settings.workMinutes * 60_000,
  );

  // Keep latest values in refs so the tick callback stays stable.
  const settingsRef = useRef(settings);
  const phaseRef = useRef(phase);
  const statusRef = useRef(status);
  const completedRef = useRef(completedPomodoros);
  const onCompleteRef = useRef(options.onPhaseComplete);

  useEffect(() => {
    settingsRef.current = settings;
    phaseRef.current = phase;
    statusRef.current = status;
    completedRef.current = completedPomodoros;
    onCompleteRef.current = options.onPhaseComplete;
  });

  const totalMs = minutesForPhase(phase, settings) * 60_000;

  // When phase changes while idle, reset remaining to that phase's duration.
  // Also handles settings changes for the current phase while idle.
  useEffect(() => {
    if (statusRef.current === "idle") {
      setRemainingMs(minutesForPhase(phase, settings) * 60_000);
    }
  }, [
    phase,
    settings.workMinutes,
    settings.shortBreakMinutes,
    settings.longBreakMinutes,
    settings,
  ]);

  const advancePhase = useCallback(() => {
    const finished = phaseRef.current;
    let newCompleted = completedRef.current;
    if (finished === "work") {
      newCompleted = newCompleted + 1;
      setCompletedPomodoros(newCompleted);
    }
    const next = nextPhaseAfter(
      finished,
      newCompleted,
      settingsRef.current.longBreakInterval,
    );

    onCompleteRef.current?.(finished, next);

    const nextDurationMs =
      minutesForPhase(next, settingsRef.current) * 60_000;

    setPhaseState(next);

    if (settingsRef.current.autoStart) {
      endTimeRef.current = Date.now() + nextDurationMs;
      setStatus("running");
      setRemainingMs(nextDurationMs);
    } else {
      endTimeRef.current = null;
      setStatus("idle");
      setRemainingMs(nextDurationMs);
    }
  }, []);

  // The tick loop. Only runs while running.
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      if (endTimeRef.current == null) return;
      const next = endTimeRef.current - Date.now();
      if (next <= 0) {
        advancePhase();
      } else {
        setRemainingMs(next);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [status, advancePhase]);

  const start = useCallback(() => {
    if (statusRef.current === "running") return;
    // From idle, remainingMs is the full duration; from paused, it's what's left.
    endTimeRef.current = Date.now() + remainingMs;
    setStatus("running");
  }, [remainingMs]);

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    if (endTimeRef.current != null) {
      const left = Math.max(0, endTimeRef.current - Date.now());
      setRemainingMs(left);
    }
    endTimeRef.current = null;
    setStatus("paused");
  }, []);

  const reset = useCallback(() => {
    endTimeRef.current = null;
    setStatus("idle");
    setRemainingMs(
      minutesForPhase(phaseRef.current, settingsRef.current) * 60_000,
    );
  }, []);

  const skip = useCallback(() => {
    // Treat like a manual completion without incrementing work counter
    // (skip = "I don't want to do this phase").
    endTimeRef.current = null;
    const finished = phaseRef.current;
    const next = nextPhaseAfter(
      finished,
      completedRef.current,
      settingsRef.current.longBreakInterval,
    );
    setPhaseState(next);
    setStatus("idle");
    setRemainingMs(minutesForPhase(next, settingsRef.current) * 60_000);
  }, []);

  const setPhase = useCallback((p: Phase) => {
    endTimeRef.current = null;
    setStatus("idle");
    setPhaseState(p);
    setRemainingMs(minutesForPhase(p, settingsRef.current) * 60_000);
  }, []);

  return {
    phase,
    status,
    remainingMs,
    totalMs,
    completedPomodoros,
    start,
    pause,
    reset,
    skip,
    setPhase,
  };
}
