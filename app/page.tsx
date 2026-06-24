"use client";

import { Starfield } from "@/components/Starfield";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { TaskList } from "@/components/TaskList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Mascot } from "@/components/Mascot";
import { AudioController, useAudio } from "@/components/AudioController";
import { Taskbar } from "@/components/Taskbar";
import {
  WindowManagerProvider,
  ResetWindowsHint,
} from "@/components/WindowManager";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTimer } from "@/hooks/useTimer";
import { useTasks } from "@/hooks/useTasks";
import { DEFAULT_SETTINGS, normalizeSettings } from "@/lib/defaults";
import type { Settings } from "@/lib/types";

export default function Home() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "pomodoro.settings.v1",
    DEFAULT_SETTINGS,
    normalizeSettings,
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
  const { playChime, previewChime } = useAudio();
  const tasks = useTasks();

  const timer = useTimer(settings, {
    onPhaseComplete: () => playChime(),
  });

  return (
    <main className="lg:h-dvh lg:overflow-hidden w-full flex flex-col px-4 py-3 sm:py-4 gap-3">
      {/* Grid: title+mascot in row 1 (middle col); settings and tasks span both rows so their tops sit at the title's y-line on desktop */}
      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_auto_auto] lg:grid-cols-[1fr_1.15fr_1fr] lg:grid-rows-[auto_auto] gap-4 md:gap-x-6 lg:gap-x-10 lg:gap-y-1 lg:items-start">
        <div className="flex flex-col items-center gap-2 shrink-0 md:col-span-2 md:row-start-1 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:self-end">
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
        <div className="min-h-0 max-w-md w-full mx-auto md:max-w-none md:col-start-1 md:row-start-3 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:pt-40 xl:pt-60">
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            onTestChime={previewChime}
          />
        </div>
        <div className="min-h-0 flex flex-col items-center gap-3 max-w-md w-full mx-auto md:col-span-2 md:row-start-2 md:max-w-md lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:max-w-none">
          <PomodoroTimer timer={timer} />
        </div>
        <div className="min-h-0 max-w-md w-full mx-auto md:max-w-none md:col-start-2 md:row-start-3 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:pt-40 xl:pt-60">
          <TaskList
            tasks={tasks.tasks}
            onAdd={tasks.add}
            onToggle={tasks.toggle}
            onRename={tasks.rename}
            onRemove={tasks.remove}
            onClearDone={tasks.clearDone}
            onMove={tasks.move}
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
        soundOn={settings.soundOn}
        activePhase={timer.phase}
      />
    </main>
  );
}
