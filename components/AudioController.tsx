"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface AudioControllerValue {
  playChime: () => void;
  previewChime: () => void;
  playClick: () => void;
}

const Ctx = createContext<AudioControllerValue>({
  playChime: () => {},
  previewChime: () => {},
  playClick: () => {},
});

export function useAudio() {
  return useContext(Ctx);
}

interface AudioControllerProps {
  soundOn: boolean;
  children: ReactNode;
}

/**
 * Mounts the chime <audio> element once.
 *
 * Browsers block autoplay until a user gesture, so the first play() call
 * after a click will succeed; before that it may reject and we swallow it.
 */
export function AudioController({
  soundOn,
  children,
}: AudioControllerProps) {
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const playChimeNow = useCallback(() => {
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

  const playChime = useCallback(() => {
    if (!soundOnRef.current) return;
    playChimeNow();
  }, [playChimeNow]);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (audioContextRef.current) return audioContextRef.current;

    const AudioCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtor) return null;
    audioContextRef.current = new AudioCtor();
    return audioContextRef.current;
  }, []);

  const playClickNow = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const play = () => {
        const now = ctx.currentTime;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(900, now);
        oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.045);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.06);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      };

      if (ctx.state === "suspended") {
        ctx.resume().then(play).catch(() => {
          /* blocked */
        });
        return;
      }

      play();
    } catch {
      /* browser audio unavailable */
    }
  }, [getAudioContext]);

  const playClick = useCallback(() => {
    if (!soundOnRef.current) return;
    playClickNow();
  }, [playClickNow]);

  return (
    <Ctx.Provider value={{ playChime, previewChime: playChimeNow, playClick }}>
      <audio
        ref={chimeRef}
        src="/audio/chime.wav"
        preload="auto"
        aria-hidden
      />
      {children}
    </Ctx.Provider>
  );
}
