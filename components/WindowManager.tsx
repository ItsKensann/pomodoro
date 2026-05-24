"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface WindowManagerContextValue {
  registerMoved: (id: string, moved: boolean) => void;
  resetAll: () => void;
  hasMoved: boolean;
  resetSignal: number;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [movedIds, setMovedIds] = useState<Set<string>>(() => new Set());
  const [resetSignal, setResetSignal] = useState(0);

  const registerMoved = useCallback((id: string, moved: boolean) => {
    setMovedIds((prev) => {
      const has = prev.has(id);
      if (moved === has) return prev;
      const next = new Set(prev);
      if (moved) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setResetSignal((n) => n + 1);
    setMovedIds(new Set());
  }, []);

  const value = useMemo(
    () => ({
      registerMoved,
      resetAll,
      hasMoved: movedIds.size > 0,
      resetSignal,
    }),
    [registerMoved, resetAll, movedIds, resetSignal],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  return useContext(WindowManagerContext);
}

export function ResetWindowsHint() {
  const manager = useWindowManager();
  if (!manager?.hasMoved) return null;

  return (
    <button
      type="button"
      onClick={manager.resetAll}
      className="font-pixel text-[8px] text-pink opacity-80 hover:opacity-100 hover:text-cyan shrink-0 cursor-pointer transition-colors"
      style={{ animation: "fade-in 400ms ease-out" }}
    >
      » click to reset window positions «
    </button>
  );
}
