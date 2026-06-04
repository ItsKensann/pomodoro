import type { Phase, TimerStatus } from "./types";

// The favicon mascot is recolored per timer state so the tab reflects what's
// happening at a glance: regular during focus, blue during breaks, grayed when
// paused. Mirrors the static art in app/icon.svg — keep the two in sync if the
// pixel shape changes.
interface IconPalette {
  body: string;
  ear: string;
  eye: string;
  nose: string;
}

// Focus: the default mauve/pink/cyan palette (matches app/icon.svg).
const FOCUS: IconPalette = {
  body: "#b794f6",
  ear: "#ff6ec7",
  eye: "#6ee7ff",
  nose: "#ff6ec7",
};

// Break: washed in the cyan/blue used by the window title bars.
const BREAK: IconPalette = {
  body: "#6ee7ff",
  ear: "#5ab0e0",
  eye: "#b794f6",
  nose: "#ff6ec7",
};

// Paused: desaturated so the tab reads as "stopped".
const PAUSED: IconPalette = {
  body: "#6f6a7d",
  ear: "#8a8694",
  eye: "#b6b2c0",
  nose: "#8a8694",
};

function paletteFor(phase: Phase, status: TimerStatus): IconPalette {
  if (status === "paused") return PAUSED;
  return phase === "work" ? FOCUS : BREAK;
}

function buildSvg({ body, ear, eye, nose }: IconPalette): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <circle cx="16" cy="16" r="15.5" fill="#0a0717" stroke="#2d1f4f" stroke-width="1"/>
  <g fill="${body}">
    <rect x="8" y="5" width="1" height="1"/>
    <rect x="7" y="6" width="3" height="1"/>
    <rect x="7" y="7" width="4" height="1"/>
    <rect x="6" y="8" width="5" height="1"/>
    <rect x="6" y="9" width="6" height="1"/>
    <rect x="23" y="5" width="1" height="1"/>
    <rect x="22" y="6" width="3" height="1"/>
    <rect x="21" y="7" width="4" height="1"/>
    <rect x="21" y="8" width="5" height="1"/>
    <rect x="20" y="9" width="6" height="1"/>
    <rect x="6" y="10" width="20" height="1"/>
    <rect x="5" y="11" width="22" height="10"/>
    <rect x="6" y="21" width="20" height="1"/>
    <rect x="7" y="22" width="18" height="1"/>
    <rect x="9" y="23" width="14" height="1"/>
    <rect x="11" y="24" width="10" height="1"/>
  </g>
  <g fill="${ear}">
    <rect x="8" y="7" width="1" height="2"/>
    <rect x="23" y="7" width="1" height="2"/>
  </g>
  <g fill="${eye}">
    <rect x="10" y="13" width="3" height="2"/>
    <rect x="19" y="13" width="3" height="2"/>
  </g>
  <g fill="#0a0717">
    <rect x="11" y="14" width="1" height="1"/>
    <rect x="20" y="14" width="1" height="1"/>
  </g>
  <rect x="15" y="17" width="2" height="1" fill="${nose}"/>
  <g fill="#0a0717">
    <rect x="15" y="19" width="1" height="1"/>
    <rect x="17" y="19" width="1" height="1"/>
    <rect x="16" y="20" width="1" height="1"/>
  </g>
</svg>`;
}

/** SVG data URI for the mascot tinted to the given timer state. */
export function faviconDataUri(phase: Phase, status: TimerStatus): string {
  return `data:image/svg+xml,${encodeURIComponent(buildSvg(paletteFor(phase, status)))}`;
}

/**
 * Swap the document favicon to `href`. Removes any other `rel="icon"` links
 * (e.g. the one Next injects from app/icon.svg) so the managed one always wins.
 */
export function setFavicon(href: string): void {
  if (typeof document === "undefined") return;
  const head = document.head;

  head.querySelectorAll("link[rel~='icon']").forEach((el) => {
    if (el.id !== "dynamic-favicon") el.remove();
  });

  let link = head.querySelector<HTMLLinkElement>("#dynamic-favicon");
  if (!link) {
    link = document.createElement("link");
    link.id = "dynamic-favicon";
    link.rel = "icon";
    link.type = "image/svg+xml";
    head.appendChild(link);
  }
  link.href = href;
}
