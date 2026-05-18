"use client";

import { useEffect, useRef, useState } from "react";
import { Window } from "./Window";

const LOFI_VIDEO_ID = "jfKfPfyJRdk";
const YOUTUBE_API_SCRIPT_ID = "youtube-iframe-api";
const YOUTUBE_API_SRC = "https://www.youtube.com/iframe_api";

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
}

interface YouTubePlayerOptions {
  videoId: string;
  width: string;
  height: string;
  playerVars: Record<string, number | string>;
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
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
}

export function LofiRadio({ musicOn }: LofiRadioProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const desiredMusicOnRef = useRef(musicOn);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    desiredMusicOnRef.current = musicOn;
  }, [musicOn]);

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
            controls: 1,
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
                tryPlayback(() => event.target.playVideo());
              }
            },
          },
        });

        playerRef.current = player;
      })
      .catch(() => {
        /* Leave the radio window mounted even if the third-party script fails. */
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;

    if (musicOn) {
      tryPlayback(() => player.playVideo());
    } else {
      tryPlayback(() => player.pauseVideo());
    }
  }, [isReady, musicOn]);

  return (
    <Window
      title="lofi.radio"
      accent="cyan"
      className="w-full max-w-[360px] min-w-[200px]"
      bodyClassName="p-2"
    >
      <div className="bevel-in bg-night-deep min-w-[200px] min-h-[200px] aspect-square overflow-hidden [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full">
        <div ref={mountRef} className="h-full w-full" />
      </div>
    </Window>
  );
}
