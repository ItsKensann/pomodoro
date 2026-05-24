"use client";

import { Starfield } from "@/components/Starfield";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { TaskList } from "@/components/TaskList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Mascot } from "@/components/Mascot";
import { AudioController, useAudio } from "@/components/AudioController";
import { LofiRadio } from "@/components/LofiRadio";
import { Taskbar } from "@/components/Taskbar";
import {
  WindowManagerProvider,
  ResetWindowsHint,
} from "@/components/WindowManager";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTimer } from "@/hooks/useTimer";
import { useTasks } from "@/hooks/useTasks";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { Settings } from "@/lib/types";

export default function Home() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "pomodoro.settings.v1",
    DEFAULT_SETTINGS,
  );

  return (
    <>
      <Starfield />
      <AudioController soundOn={settings.soundOn}>
        <WindowManagerProvider>
          <AppContent settings={settings} setSettings={setSettings} />
        </WindowManagerProvider>
      </AudioController>
    </>
  );
}

function AppContent({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (next: Settings | ((prev: Settings) => Settings)) => void;
}) {
  const { playChime } = useAudio();
  const tasks = useTasks();

  const timer = useTimer(settings, {
    onPhaseComplete: () => playChime(),
  });

  function handleMusicChange(musicOn: boolean) {
    setSettings((s) => ({ ...s, musicOn }));
  }

  return (
    <main className="lg:h-dvh lg:overflow-hidden w-full flex flex-col px-4 py-3 sm:py-4 gap-3">
      {/* Grid: title+mascot in row 1 (middle col); settings and tasks span both rows so their tops sit at the title's y-line on desktop */}
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1fr] lg:grid-rows-[auto_auto] gap-4 lg:gap-x-10 lg:gap-y-1 lg:items-start">
        <div className="flex flex-col items-center gap-2 shrink-0 lg:col-start-2 lg:row-start-1 lg:self-end">
          <h1
            className="font-pixel text-pink text-lg sm:text-xl text-center"
            style={{
              textShadow:
                "2px 2px 0 var(--color-pink-deep), 4px 4px 0 var(--color-night-deep)",
            }}
          >
            ♪ lofi.pomodoro ♪
          </h1>
          <Mascot asleep={timer.status !== "running"} width={72} height={45} />
        </div>
        <div className="min-h-0 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:pt-60">
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            onMusicChange={handleMusicChange}
          />
        </div>
        <div className="min-h-0 flex flex-col items-center gap-3 lg:col-start-2 lg:row-start-2">
          <PomodoroTimer timer={timer} />
          <LofiRadio
            musicOn={settings.musicOn}
            onMusicChange={handleMusicChange}
          />
        </div>
        <div className="min-h-0 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:pt-60">
          <TaskList
            tasks={tasks.tasks}
            onAdd={tasks.add}
            onToggle={tasks.toggle}
            onRemove={tasks.remove}
            onClearDone={tasks.clearDone}
          />
        </div>
      </div>

      {/* Keyboard hint footer — pinned at the bottom on all screen sizes */}
      <footer className="font-pixel text-[8px] text-mauve opacity-70 text-center shrink-0">
        [space] start/pause &nbsp;·&nbsp; [r] reset
      </footer>
      <div className="flex justify-end shrink-0">
        <ResetWindowsHint />
      </div>
      <Taskbar
        musicOn={settings.musicOn}
        soundOn={settings.soundOn}
        activePhase={timer.phase}
      />
    </main>
  );
}
