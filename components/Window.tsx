"use client";

import type { ReactNode } from "react";

interface WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  accent?: "pink" | "cyan" | "mauve";
  onClose?: () => void;
}

const accentMap: Record<NonNullable<WindowProps["accent"]>, string> = {
  pink: "from-pink to-pink-deep",
  cyan: "from-cyan to-mauve",
  mauve: "from-mauve to-pink-deep",
};

export function Window({
  title,
  children,
  className = "",
  bodyClassName = "",
  accent = "pink",
  onClose,
}: WindowProps) {
  return (
    <div className={`bevel-out bg-panel ${className}`}>
      <div
        className={`flex items-center justify-between px-2 py-1.5 bg-gradient-to-r ${accentMap[accent]} border-b-2 border-edge-dark`}
      >
        <span className="font-pixel text-[10px] text-cream drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)] truncate">
          {title}
        </span>
        <div className="flex gap-1 shrink-0">
          <WindowChromeButton label="_" />
          <WindowChromeButton label="□" />
          <WindowChromeButton label="✕" onClick={onClose} />
        </div>
      </div>
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

function WindowChromeButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      aria-hidden={!onClick}
      className="bevel-out bg-panel w-5 h-5 flex items-center justify-center font-pixel text-[8px] text-cream leading-none active:bevel-in cursor-pointer hover:bg-panel-soft transition-colors"
    >
      {label}
    </button>
  );
}
