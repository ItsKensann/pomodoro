"use client";

import { useCallback, useEffect } from "react";
import type { UseTimerReturn } from "@/hooks/useTimer";
import { PHASE_LABEL } from "@/lib/defaults";
import { faviconDataUri, setFavicon } from "@/lib/favicon";
import { useAudio } from "./AudioController";
import { Window } from "./Window";
import { PixelButton } from "./PixelButton";

const DEFAULT_DOCUMENT_TITLE = "pomodoro.exe";

interface PomodoroTimerProps {
  timer: UseTimerReturn;
}

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function PomodoroTimer({ timer }: PomodoroTimerProps) {
  const { playClick } = useAudio();
  const {
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
  } = timer;

  const toggleStartPause = useCallback(() => {
    playClick();
    if (status === "running") pause();
    else start();
  }, [playClick, status, pause, start]);

  useEffect(() => {
    document.title = `${formatTime(remainingMs)} ${PHASE_LABEL[phase]} - pomodoro.exe`;

    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [phase, remainingMs]);

  // Tint the tab favicon to match the timer state: regular during focus, blue
  // during breaks, grayed out when paused.
  useEffect(() => {
    setFavicon(faviconDataUri(phase, status));
  }, [phase, status]);

  // Keyboard shortcuts: space = toggle start/pause, R = reset.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleStartPause();
      } else if (e.key.toLowerCase() === "r") {
        reset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleStartPause, reset]);

  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;

  return (
    <Window title="◆ pomodoro.exe" accent="pink" className="w-full">
      <div className="flex flex-col items-center gap-3">
        {/* Phase tabs */}
        <div className="flex gap-1 w-full">
          {(["work", "shortBreak", "longBreak"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className={`
                flex-1 font-pixel text-[8px] py-2 px-1 transition-colors cursor-pointer
                ${
                  phase === p
                    ? "bevel-in bg-night text-pink"
                    : "bevel-out bg-panel text-cream hover:bg-panel-soft"
                }
              `}
            >
              {PHASE_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Timer display */}
        <div className="bevel-in bg-night-deep w-full py-4 px-4 flex flex-col items-center gap-1">
          <div
            className="font-pixel text-[44px] sm:text-[56px] text-moon leading-none tracking-wider"
            style={{
              textShadow:
                "3px 3px 0 var(--color-pink-deep), 6px 6px 0 var(--color-night)",
            }}
          >
            {formatTime(remainingMs)}
          </div>
          <div className="font-pixel text-[8px] text-cyan tracking-widest">
            {status === "running"
              ? "● now playing ●"
              : status === "paused"
                ? "‖ paused"
                : "▶ press start"}
          </div>
        </div>

        {/* Progress bar (chunky pixel) */}
        <div className="bevel-in bg-night-deep w-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink to-mauve transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-wrap justify-center">
          {status === "running" ? (
            <PixelButton variant="primary" size="md" onClick={toggleStartPause}>
              pause
            </PixelButton>
          ) : (
            <PixelButton variant="primary" size="md" onClick={toggleStartPause}>
              {status === "paused" ? "resume" : "start"}
            </PixelButton>
          )}
          <PixelButton size="md" onClick={reset}>
            reset
          </PixelButton>
          <PixelButton size="md" variant="ghost" onClick={skip}>
            skip »
          </PixelButton>
        </div>

        {/* Pomodoro counter */}
        <div className="flex items-center gap-2 font-pixel text-[8px] text-cream">
          <span className="text-mauve">★</span>
          <span>{completedPomodoros} completed today</span>
          <span className="text-mauve">★</span>
        </div>
      </div>
    </Window>
  );
}
