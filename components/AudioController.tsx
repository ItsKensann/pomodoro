"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface AudioContextValue {
  playChime: () => void;
}

const Ctx = createContext<AudioContextValue>({ playChime: () => {} });

export function useAudio() {
  return useContext(Ctx);
}

interface AudioControllerProps {
  soundOn: boolean;
  children: ReactNode;
}

/**
 * Mounts the chime <audio> element once, and exposes playChime() via context.
 *
 * Browsers block autoplay until a user gesture, so the first play() call
 * after a click will succeed; before that it may reject and we swallow it.
 */
export function AudioController({
  soundOn,
  children,
}: AudioControllerProps) {
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const playChime = useCallback(() => {
    if (!soundOnRef.current) return;
    const el = chimeRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.volume = 0.6;
    const p = el.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* missing asset or blocked */
      });
    }
  }, []);

  return (
    <Ctx.Provider value={{ playChime }}>
      <audio
        ref={chimeRef}
        src="/audio/chime.mp3"
        preload="auto"
        aria-hidden
      />
      {children}
    </Ctx.Provider>
  );
}
