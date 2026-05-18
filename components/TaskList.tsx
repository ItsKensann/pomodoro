"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { Window } from "./Window";
import { PixelButton } from "./PixelButton";

interface TaskListProps {
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClearDone: () => void;
}

export function TaskList({
  tasks,
  onAdd,
  onToggle,
  onRemove,
  onClearDone,
}: TaskListProps) {
  const [input, setInput] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(input);
    setInput("");
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Window
      title="◆ to-do.txt"
      accent="cyan"
      className="w-full h-full flex flex-col"
      bodyClassName="flex-1 min-h-0 flex flex-col"
    >
      <form onSubmit={submit} className="flex gap-2 mb-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="add a task..."
          maxLength={120}
          className="
            flex-1 bevel-in bg-night-deep text-cream
            px-3 py-2 font-mono text-base
            placeholder:text-mauve placeholder:opacity-60
            focus:outline-none focus:text-cyan
            min-w-0
          "
        />
        <PixelButton type="submit" variant="accent" size="md">
          add +
        </PixelButton>
      </form>

      <ul className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto pr-1">
        {tasks.length === 0 && (
          <li className="text-mauve font-mono text-base text-center py-4 opacity-70">
            ~ no tasks yet ~
          </li>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 group bevel-in bg-night px-2 py-1.5"
          >
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              className={`
                bevel-out shrink-0 w-5 h-5 flex items-center justify-center
                font-pixel text-[10px] cursor-pointer
                ${task.done ? "bg-pink text-night-deep" : "bg-panel text-cream"}
              `}
              aria-label={task.done ? "mark not done" : "mark done"}
            >
              {task.done ? "✓" : ""}
            </button>
            <span
              className={`
                flex-1 font-mono text-base break-words min-w-0
                ${task.done ? "line-through text-mauve opacity-60" : "text-cream"}
              `}
            >
              {task.text}
            </span>
            <button
              type="button"
              onClick={() => onRemove(task.id)}
              className="
                shrink-0 font-pixel text-[8px] text-mauve
                opacity-0 group-hover:opacity-100 hover:text-pink
                cursor-pointer transition-opacity
              "
              aria-label="delete task"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {doneCount > 0 && (
        <div className="mt-3 flex justify-end shrink-0">
          <PixelButton size="sm" variant="ghost" onClick={onClearDone}>
            clear {doneCount} done
          </PixelButton>
        </div>
      )}
    </Window>
  );
}
