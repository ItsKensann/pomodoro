"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hydration-safe persisted state. Reads from localStorage on mount (not at
 * init), so SSR and the first client render agree.
 *
 * Returns: [value, setValue, hydrated]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        // Hydration-safe: SSR renders default, client swaps to stored value on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // ignore parse errors; keep default
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage may be full or disabled; ignore
    }
  }, [key, value, hydrated]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  }, []);

  return [value, set, hydrated];
}
