"use client";

import { useEffect, useRef, useState } from "react";
import type { Phase } from "@/lib/types";
import { PHASE_ACCENT } from "@/lib/defaults";

interface TaskbarProps {
  soundOn: boolean;
  activePhase: Phase;
}

export function Taskbar({ soundOn, activePhase }: TaskbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const startRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div
      className="bevel-out bg-panel shrink-0 flex items-center gap-1 px-1 py-1"
      role="navigation"
      aria-label="Taskbar"
    >
      <div ref={startRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="bevel-out bg-gradient-to-r from-pink to-pink-deep px-2 py-1 font-pixel text-[10px] text-cream leading-none cursor-pointer active:bevel-in active:translate-x-px active:translate-y-px flex items-center gap-1"
          style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
        >
          <span aria-hidden>♪</span>
          <span>start</span>
        </button>
        {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}
      </div>

      <div className="flex-1 min-w-0 hidden sm:flex items-center gap-1 overflow-x-auto">
        <AppTab
          label="◆ pomodoro.exe"
          active
          accentColor={PHASE_ACCENT[activePhase]}
        />
        <AppTab label="◆ to-do.txt" />
        <AppTab label="◆ settings.cfg" />
      </div>
      {/* On phones the tab row is hidden — keep a spacer so the tray stays right-aligned. */}
      <div className="flex-1 sm:hidden" aria-hidden />

      <div className="bevel-in bg-night shrink-0 flex items-center gap-2 px-2 py-1">
        <TrayIcon glyph="◈" on={soundOn} onColor="text-pink" />
        <span className="w-px h-3 bg-edge-light/40" aria-hidden />
        <Clock />
      </div>
    </div>
  );
}

function StartMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute bottom-full mb-1 left-0 w-48 bevel-out bg-panel z-50"
      role="menu"
    >
      <div
        className="bg-gradient-to-r from-pink to-pink-deep px-2 py-1 font-pixel text-[9px] text-cream leading-none"
        style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.6)" }}
      >
        ♪ lofi.pomodoro
      </div>
      <ul className="py-1">
        <MenuItem icon="▶" label="Programs" onClose={onClose} />
        <MenuItem icon="▤" label="Documents" onClose={onClose} />
        <MenuItem icon="⚙" label="Settings" onClose={onClose} />
        <li className="my-1 border-t border-edge-dark/60" aria-hidden />
        <MenuItem icon="⏻" label="Shut Down..." onClose={onClose} />
      </ul>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClose,
}: {
  icon: string;
  label: string;
  onClose: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="menuitem"
        onClick={onClose}
        className="w-full text-left px-2 py-1 font-pixel text-[9px] text-cream hover:bg-panel-soft cursor-pointer flex items-center gap-2 leading-none"
      >
        <span aria-hidden className="text-mauve w-3 text-center">
          {icon}
        </span>
        <span>{label}</span>
      </button>
    </li>
  );
}

function AppTab({
  label,
  active = false,
  accentColor,
}: {
  label: string;
  active?: boolean;
  accentColor?: string;
}) {
  return (
    <div
      className={`relative shrink-0 px-2 py-1 font-pixel text-[8px] leading-none whitespace-nowrap ${
        active ? "bevel-in bg-panel text-cream" : "bevel-out bg-panel-soft text-cream/80"
      }`}
    >
      {active && accentColor && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <span className={active ? "pl-1.5" : ""}>{label}</span>
    </div>
  );
}

function TrayIcon({
  glyph,
  on,
  onColor,
}: {
  glyph: string;
  on: boolean;
  onColor: string;
}) {
  return (
    <span
      aria-hidden
      className={`font-pixel text-[10px] leading-none ${
        on ? `${onColor} drop-shadow-[0_0_2px_currentColor]` : "text-mauve/30"
      }`}
    >
      {glyph}
    </span>
  );
}

function Clock() {
  const [now, setNow] = useState<string>("--:--");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="font-pixel text-[9px] text-cream tabular-nums leading-none">
      {now}
    </span>
  );
}
