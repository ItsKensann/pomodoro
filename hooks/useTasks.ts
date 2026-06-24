"use client";

import { useCallback } from "react";
import type { Task } from "@/lib/types";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "pomodoro.tasks.v1";

export function useTasks() {
  const [tasks, setTasks, hydrated] = useLocalStorage<Task[]>(KEY, []);

  const add = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const task: Task = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: trimmed,
        done: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [...prev, task]);
    },
    [setTasks],
  );

  const toggle = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      );
    },
    [setTasks],
  );

  const rename = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
      );
    },
    [setTasks],
  );

  const remove = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks],
  );

  const clearDone = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done));
  }, [setTasks]);

  const move = useCallback(
    (fromId: string, toId: string, position: "before" | "after") => {
      if (fromId === toId) return;
      setTasks((prev) => {
        const fromIdx = prev.findIndex((t) => t.id === fromId);
        if (fromIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        const toIdx = next.findIndex((t) => t.id === toId);
        if (toIdx === -1) return prev;
        const insertIdx = position === "after" ? toIdx + 1 : toIdx;
        next.splice(insertIdx, 0, moved);
        return next;
      });
    },
    [setTasks],
  );

  return { tasks, add, toggle, rename, remove, clearDone, move, hydrated };
}
