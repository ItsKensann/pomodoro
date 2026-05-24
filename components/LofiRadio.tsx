"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Window } from "./Window";

const LOFI_VIDEO_ID = "jfKfPfyJRdk";
const PLAYBACK_START_TIMEOUT_MS = 5000;
const YOUTUBE_API_SCRIPT_ID = "youtube-iframe-api";
const YOUTUBE_API_SRC = "https://www.youtube.com/iframe_api";
const YOUTUBE_PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
} as const;

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
}

interface YouTubePlayerStateEvent extends YouTubePlayerEvent {
  data: number;
}

interface YouTubePlayerOptions {
  videoId: string;
  width: string;
  height: string;
  playerVars: Record<string, number | string>;
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
    onStateChange: (event: YouTubePlayerStateEvent) => void;
    onError: () => void;
  };
}

interface YouTubeApi {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();

      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube IFrame API loaded without YT.Player."));
      }
    };

    const existingScript = document.getElementById(YOUTUBE_API_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load the YouTube IFrame API.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = YOUTUBE_API_SCRIPT_ID;
    script.src = YOUTUBE_API_SRC;
    script.async = true;
    script.addEventListener(
      "error",
      () => reject(new Error("Unable to load the YouTube IFrame API.")),
      { once: true },
    );

    document.head.appendChild(script);
  }).catch((error) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

function tryPlayback(action: () => void) {
  try {
    action();
  } catch {
    /* YouTube/browser playback errors are best-effort. */
  }
}

interface LofiRadioProps {
  musicOn: boolean;
  onMusicChange: (musicOn: boolean) => void;
}

export function LofiRadio({ musicOn, onMusicChange }: LofiRadioProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const desiredMusicOnRef = useRef(musicOn);
  const onMusicChangeRef = useRef(onMusicChange);
  const playbackTimeoutRef = useRef<number | null>(null);
  const playAttemptRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [thumbnailOk, setThumbnailOk] = useState(true);

  useEffect(() => {
    desiredMusicOnRef.current = musicOn;
  }, [musicOn]);

  useEffect(() => {
    onMusicChangeRef.current = onMusicChange;
  }, [onMusicChange]);

  const clearPlaybackTimeout = useCallback(() => {
    if (playbackTimeoutRef.current == null) return;

    window.clearTimeout(playbackTimeoutRef.current);
    playbackTimeoutRef.current = null;
  }, []);

  const failPlaybackRequest = useCallback(() => {
    clearPlaybackTimeout();

    if (!desiredMusicOnRef.current) return;

    desiredMusicOnRef.current = false;
    onMusicChangeRef.current(false);
  }, [clearPlaybackTimeout]);

  const requestPlayback = useCallback(
    (player: YouTubePlayer | null) => {
      clearPlaybackTimeout();

      const attempt = playAttemptRef.current + 1;
      playAttemptRef.current = attempt;
      playbackTimeoutRef.current = window.setTimeout(() => {
        if (
          desiredMusicOnRef.current &&
          playAttemptRef.current === attempt
        ) {
          failPlaybackRequest();
        }
      }, PLAYBACK_START_TIMEOUT_MS);

      if (player) {
        tryPlayback(() => player.playVideo());
      }
    },
    [clearPlaybackTimeout, failPlaybackRequest],
  );

  const pausePlayback = useCallback((player: YouTubePlayer) => {
    tryPlayback(() => player.pauseVideo());
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current || playerRef.current) return;

        const player = new YT.Player(mountRef.current, {
          videoId: LOFI_VIDEO_ID,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;

              playerRef.current = event.target;
              const iframe = event.target.getIframe();
              iframe.title = "Lofi Girl study radio";
              iframe.setAttribute(
                "allow",
                "autoplay; encrypted-media; picture-in-picture; fullscreen",
              );
              setIsReady(true);

              if (desiredMusicOnRef.current) {
                requestPlayback(event.target);
              }
            },
            onStateChange: (event) => {
              if (event.data === YOUTUBE_PLAYER_STATE.PLAYING) {
                clearPlaybackTimeout();

                if (!desiredMusicOnRef.current) {
                  pausePlayback(event.target);
                }
                return;
              }

              if (
                desiredMusicOnRef.current &&
                (event.data === YOUTUBE_PLAYER_STATE.ENDED ||
                  event.data === YOUTUBE_PLAYER_STATE.PAUSED) &&
                playbackTimeoutRef.current == null
              ) {
                failPlaybackRequest();
              }
            },
            onError: () => {
              if (desiredMusicOnRef.current) {
                failPlaybackRequest();
              }
            },
          },
        });

        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled && desiredMusicOnRef.current) {
          failPlaybackRequest();
        }
        /* Leave the radio window mounted even if the third-party script fails. */
      });

    return () => {
      cancelled = true;
      clearPlaybackTimeout();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [
    clearPlaybackTimeout,
    failPlaybackRequest,
    pausePlayback,
    requestPlayback,
  ]);

  useEffect(() => {
    const player = playerRef.current;

    if (musicOn) {
      requestPlayback(player && isReady ? player : null);
    } else {
      clearPlaybackTimeout();

      if (player && isReady) {
        pausePlayback(player);
      }
    }
  }, [
    clearPlaybackTimeout,
    isReady,
    musicOn,
    pausePlayback,
    requestPlayback,
  ]);

  function handleToggleMusic() {
    const nextMusicOn = !musicOn;
    desiredMusicOnRef.current = nextMusicOn;

    const player = playerRef.current;
    if (nextMusicOn) {
      onMusicChange(true);
      if (player && isReady) {
        requestPlayback(player);
      } else {
        requestPlayback(null);
      }
    } else {
      clearPlaybackTimeout();
      if (player && isReady) {
        pausePlayback(player);
      }
      onMusicChange(false);
    }
  }

  return (
    <Window
      title="lofi.radio"
      accent="cyan"
      className="w-full max-w-[420px] min-w-[240px]"
      bodyClassName="p-2"
    >
      <div className="bevel-in bg-night-deep aspect-video w-full min-w-[240px] overflow-hidden relative">
        <div
          ref={mountRef}
          className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
          aria-hidden
        />
        <button
          type="button"
          onClick={handleToggleMusic}
          aria-label={musicOn ? "Pause lofi radio" : "Play lofi radio"}
          aria-pressed={musicOn}
          className="absolute inset-0 w-full h-full cursor-pointer group focus:outline-none"
        >
          {thumbnailOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/lofi/thumbnail.png"
              alt=""
              onError={() => setThumbnailOk(false)}
              className="absolute inset-0 w-full h-full object-cover pixelated"
            />
          ) : (
            <ThumbnailPlaceholder />
          )}
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
          >
            <span className="font-pixel text-cream text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              {musicOn ? "❚❚" : "▶"}
            </span>
          </span>
        </button>
      </div>
    </Window>
  );
}

function ThumbnailPlaceholder() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-panel via-pink-deep to-night flex items-center justify-center">
      <span
        className="font-pixel text-cream text-sm"
        style={{
          textShadow:
            "1px 1px 0 var(--color-pink-deep), 2px 2px 0 var(--color-night-deep)",
        }}
      >
        ♪ lofi.radio
      </span>
    </div>
  );
}
