"use client";

interface MascotProps {
  className?: string;
  asleep?: boolean;
  width?: number;
  height?: number;
}

/**
 * A sleeping pixel cat curled up. Drawn as a 32x20 SVG with crispEdges
 * rendering so it scales without blurring. The "z z z" letters above its
 * head loop on a stagger when asleep is true.
 */
export function Mascot({
  className = "",
  asleep = true,
  width = 160,
  height = 100,
}: MascotProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ animation: asleep ? "breathe 4s ease-in-out infinite" : undefined }}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 20"
        width={width}
        height={height}
        shapeRendering="crispEdges"
        className="pixelated"
        role="img"
      >
        {/* ears */}
        <g fill="var(--color-mauve)">
          <rect x="5" y="5" width="2" height="2" />
          <rect x="6" y="6" width="2" height="2" />
          <rect x="13" y="5" width="2" height="2" />
          <rect x="12" y="6" width="2" height="2" />
        </g>
        {/* ear inner pink */}
        <g fill="var(--color-pink)">
          <rect x="6" y="6" width="1" height="1" />
          <rect x="13" y="6" width="1" height="1" />
        </g>
        {/* head + body curled */}
        <g fill="var(--color-mauve)">
          <rect x="4" y="7" width="12" height="2" />
          <rect x="3" y="9" width="14" height="2" />
          <rect x="3" y="11" width="15" height="2" />
          <rect x="3" y="13" width="16" height="2" />
          <rect x="4" y="15" width="15" height="2" />
          <rect x="5" y="17" width="13" height="1" />
        </g>
        {/* darker mauve shading along the back */}
        <g fill="#7a5db3">
          <rect x="3" y="9" width="14" height="1" />
        </g>
        {/* closed eyes */}
        <g fill="var(--color-night-deep)">
          <rect x="6" y="10" width="2" height="1" />
          <rect x="11" y="10" width="2" height="1" />
        </g>
        {/* nose */}
        <rect x="9" y="11" width="1" height="1" fill="var(--color-pink)" />
        {/* tail curl */}
        <g fill="var(--color-mauve)">
          <rect x="19" y="11" width="2" height="2" />
          <rect x="21" y="10" width="2" height="2" />
          <rect x="22" y="11" width="2" height="2" />
          <rect x="21" y="13" width="2" height="2" />
          <rect x="19" y="14" width="3" height="1" />
        </g>
        {/* paw line */}
        <g fill="var(--color-night-deep)">
          <rect x="7" y="16" width="1" height="1" />
          <rect x="11" y="16" width="1" height="1" />
          <rect x="15" y="16" width="1" height="1" />
        </g>
      </svg>

      {/* floating zzz letters */}
      {asleep && (
        <div className="absolute -top-2 left-20 font-pixel text-cyan select-none">
          <span
            className="absolute text-[10px]"
            style={{
              animation: "zzz-rise 3s ease-out infinite",
              animationDelay: "0s",
            }}
          >
            z
          </span>
          <span
            className="absolute text-[10px] left-3 top-1"
            style={{
              animation: "zzz-rise 3s ease-out infinite",
              animationDelay: "1s",
            }}
          >
            z
          </span>
          <span
            className="absolute text-[10px] left-6 top-2"
            style={{
              animation: "zzz-rise 3s ease-out infinite",
              animationDelay: "2s",
            }}
          >
            z
          </span>
        </div>
      )}
    </div>
  );
}
