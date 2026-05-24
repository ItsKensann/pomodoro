"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useWindowManager } from "./WindowManager";

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

// Module-level counter so the most recently dragged window stacks on top.
let topZ = 10;

// Shared media-query subscription for the lg breakpoint (drag is desktop-only).
const DESKTOP_MQ = "(min-width: 1024px)";
function subscribeDesktopMq(callback: () => void) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getDesktopMqSnapshot() {
  return window.matchMedia(DESKTOP_MQ).matches;
}
function getDesktopMqServerSnapshot() {
  return false;
}

export function Window({
  title,
  children,
  className = "",
  bodyClassName = "",
  accent = "pink",
  onClose,
}: WindowProps) {
  const id = useId();
  const manager = useWindowManager();
  const registerMoved = manager?.registerMoved;
  const resetSignal = manager?.resetSignal ?? 0;

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastSeenReset, setLastSeenReset] = useState(resetSignal);
  const [z, setZ] = useState(10);
  const [dragging, setDragging] = useState(false);
  // Drag is desktop-only — below `lg` (1024px) the title bar is decorative.
  const canDrag = useSyncExternalStore(
    subscribeDesktopMq,
    getDesktopMqSnapshot,
    getDesktopMqServerSnapshot,
  );
  const [lastSeenCanDrag, setLastSeenCanDrag] = useState(canDrag);

  // Snap back to origin when the manager broadcasts a reset.
  // Render-time comparison is the React-recommended pattern for "react to a prop change".
  if (lastSeenReset !== resetSignal) {
    setLastSeenReset(resetSignal);
    if (offset.x !== 0 || offset.y !== 0) setOffset({ x: 0, y: 0 });
  }

  // When the viewport drops below lg, snap any dragged window back to origin
  // so it can't linger off-screen on a phone.
  if (lastSeenCanDrag !== canDrag) {
    setLastSeenCanDrag(canDrag);
    if (!canDrag && (offset.x !== 0 || offset.y !== 0)) {
      setOffset({ x: 0, y: 0 });
    }
  }
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  function bringToFront() {
    topZ += 1;
    setZ(topZ);
  }

  function onTitlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!canDrag) return;
    // Don't start drag from chrome buttons (close/min/max).
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    e.preventDefault();
    bringToFront();
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;

    function onMove(e: PointerEvent) {
      const state = dragStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      setOffset({
        x: state.originX + (e.clientX - state.startX),
        y: state.originY + (e.clientY - state.startY),
      });
    }

    function onUp(e: PointerEvent) {
      const state = dragStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      dragStateRef.current = null;
      setDragging(false);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  // Tell the manager whether this window is currently off its origin.
  useEffect(() => {
    if (!registerMoved) return;
    const moved = offset.x !== 0 || offset.y !== 0;
    registerMoved(id, moved);
  }, [offset, id, registerMoved]);

  return (
    <div
      className={`bevel-out bg-panel relative ${className}`}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        zIndex: z,
        willChange: dragging ? "transform" : undefined,
      }}
      onPointerDown={bringToFront}
    >
      <div
        onPointerDown={onTitlePointerDown}
        className={`flex items-center justify-between px-2 py-1.5 bg-gradient-to-r ${accentMap[accent]} border-b-2 border-edge-dark select-none ${
          canDrag
            ? `touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`
            : "cursor-default"
        }`}
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
