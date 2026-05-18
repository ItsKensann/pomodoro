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

  const remove = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks],
  );

  const clearDone = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done));
  }, [setTasks]);

  return { tasks, add, toggle, remove, clearDone, hydrated };
}
