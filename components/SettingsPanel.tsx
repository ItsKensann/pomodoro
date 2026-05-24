"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";
import { Window } from "./Window";
import { PixelButton } from "./PixelButton";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

interface SettingsPanelProps {
  settings: Settings;
  setSettings: (next: Settings | ((prev: Settings) => Settings)) => void;
  onMusicChange: (musicOn: boolean) => void;
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function SettingsPanel({
  settings,
  setSettings,
  onMusicChange,
}: SettingsPanelProps) {
  function updateNumber(
    key: keyof Settings,
    value: string,
    min: number,
    max: number,
  ) {
    const n = clamp(parseInt(value, 10), min, max);
    setSettings((prev) => ({ ...prev, [key]: n }));
  }

  function toggle(key: keyof Settings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Window title="◆ settings.cfg" accent="mauve" className="w-full">
      <div className="flex flex-col gap-2 font-pixel text-[10px] text-cream">
        <NumberRow
          label="focus"
          value={settings.workMinutes}
          onChange={(v) => updateNumber("workMinutes", v, 1, 180)}
          suffix="min"
        />
        <NumberRow
          label="short break"
          value={settings.shortBreakMinutes}
          onChange={(v) => updateNumber("shortBreakMinutes", v, 1, 60)}
          suffix="min"
        />
        <NumberRow
          label="long break"
          value={settings.longBreakMinutes}
          onChange={(v) => updateNumber("longBreakMinutes", v, 1, 60)}
          suffix="min"
        />
        <NumberRow
          label="long break every"
          value={settings.longBreakInterval}
          onChange={(v) => updateNumber("longBreakInterval", v, 2, 10)}
          suffix="rounds"
        />

        <div className="border-t-2 border-edge-dark border-dashed" />

        <ToggleRow
          label="auto-start next"
          value={settings.autoStart}
          onToggle={() => toggle("autoStart")}
        />
        <ToggleRow
          label="chime sound"
          value={settings.soundOn}
          onToggle={() => toggle("soundOn")}
        />
        <ToggleRow
          label="lofi music"
          value={settings.musicOn}
          onToggle={() => onMusicChange(!settings.musicOn)}
        />

        <div className="pt-2">
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => setSettings(DEFAULT_SETTINGS)}
          >
            restore defaults
          </PixelButton>
        </div>
      </div>
    </Window>
  );
}

function NumberRow({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  suffix: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [lastSyncedValue, setLastSyncedValue] = useState(value);

  if (value !== lastSyncedValue) {
    setLastSyncedValue(value);
    setDraft(String(value));
  }

  function commit() {
    const trimmed = draft.trim();
    if (trimmed === "" || Number.isNaN(parseInt(trimmed, 10))) {
      setDraft(String(value));
      return;
    }
    onChange(trimmed);
  }

  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-cream">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className="bevel-in bg-night-deep text-cyan w-16 px-2 py-1 text-right font-pixel text-[10px] focus:outline-none focus:text-pink"
        />
        <span className="text-mauve text-[8px]">{suffix}</span>
      </span>
    </label>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between gap-3 cursor-pointer hover:text-pink transition-colors"
    >
      <span>{label}</span>
      <span
        className={`bevel-out px-2 py-1 font-pixel text-[8px] ${
          value
            ? "bg-pink text-night-deep"
            : "bg-panel text-cream"
        }`}
      >
        {value ? "[ on ]" : "[ off ]"}
      </span>
    </button>
  );
}
