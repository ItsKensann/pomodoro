"use client";

import { useEffect, useState } from "react";

interface Star {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
}

const STAR_COUNT = 60;
const STAR_COLORS = [
  "var(--color-cream)",
  "var(--color-moon)",
  "var(--color-cyan)",
  "var(--color-pink)",
];

function makeStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1,
    delay: `${Math.random() * 4}s`,
    duration: `${2.5 + Math.random() * 3}s`,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }));
}

export function Starfield() {
  // Generate on the client after mount to avoid SSR/hydration mismatch.
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generated on mount so SSR/CSR markup matches (empty -> populated).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStars(makeStars());
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* deep gradient sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, #2a1655 0%, #15102b 45%, #0a0717 100%)",
        }}
      />

      {/* drifting cloud blobs */}
      <div
        className="absolute -top-10 left-0 w-[60vw] h-40 opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-mauve) 0%, transparent 70%)",
          animation: "drift 60s linear infinite",
        }}
      />
      <div
        className="absolute top-1/3 left-0 w-[40vw] h-32 opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-pink) 0%, transparent 70%)",
          animation: "drift 90s linear infinite",
          animationDelay: "-30s",
        }}
      />

      {/* twinkling stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute pixelated"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            animation: `twinkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* big moon */}
      <div
        className="absolute top-8 right-10 sm:right-20 w-20 h-20 sm:w-24 sm:h-24 pixelated"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #fff5d4 0%, var(--color-moon) 55%, #d4b766 100%)",
          borderRadius: "50%",
          boxShadow:
            "0 0 40px rgba(255, 231, 154, 0.4), 0 0 80px rgba(255, 110, 199, 0.15)",
        }}
      />
    </div>
  );
}
