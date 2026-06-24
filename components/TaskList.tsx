"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/types";
import { Window } from "./Window";
import { PixelButton } from "./PixelButton";

interface TaskListProps {
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onClearDone: () => void;
  onMove: (fromId: string, toId: string, position: "before" | "after") => void;
}

type DragOver = { id: string; pos: "before" | "after" } | null;

const EDGE_SCROLL_ZONE_PX = 48;
const EDGE_SCROLL_STEP_PX = 12;

export function TaskList({
  tasks,
  onAdd,
  onToggle,
  onRename,
  onRemove,
  onClearDone,
  onMove,
}: TaskListProps) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<DragOver>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dragOverRef = useRef<DragOver>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const skipBlurSaveRef = useRef(false);

  useEffect(() => {
    if (!editingId) return;
    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [editingId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(input);
    setInput("");
  }

  function startRename(task: Task) {
    skipBlurSaveRef.current = false;
    setEditingId(task.id);
    setEditInput(task.text);
    setDragId(null);
    setDropIntent(null);
  }

  function clearRename() {
    setEditingId(null);
    setEditInput("");
  }

  function commitRename(task: Task) {
    if (skipBlurSaveRef.current) {
      skipBlurSaveRef.current = false;
      clearRename();
      return;
    }

    const trimmed = editInput.trim();
    if (trimmed && trimmed !== task.text) {
      onRename(task.id, trimmed);
    }
    clearRename();
  }

  function cancelRename() {
    skipBlurSaveRef.current = true;
    clearRename();
  }

  function handleRenameKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    task: Task,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename(task);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  }

  const doneCount = tasks.filter((t) => t.done).length;

  function handleDragStart(e: React.DragEvent<HTMLLIElement>, id: string) {
    if (editingId === id) {
      e.preventDefault();
      return;
    }

    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    // Firefox needs data set for drag to initiate.
    e.dataTransfer.setData("text/plain", id);
  }

  function scrollListNearEdge(clientY: number) {
    const list = listRef.current;
    if (!list) return;

    const rect = list.getBoundingClientRect();
    const distanceFromTop = clientY - rect.top;
    const distanceFromBottom = rect.bottom - clientY;

    if (distanceFromTop < EDGE_SCROLL_ZONE_PX) {
      list.scrollTop -= EDGE_SCROLL_STEP_PX;
    } else if (distanceFromBottom < EDGE_SCROLL_ZONE_PX) {
      list.scrollTop += EDGE_SCROLL_STEP_PX;
    }
  }

  function setDropIntent(next: DragOver) {
    dragOverRef.current = next;
    setDragOver((prev) =>
      prev?.id === next?.id && prev?.pos === next?.pos ? prev : next,
    );
  }

  function getDropIntent(clientY: number): DragOver {
    const list = listRef.current;
    if (!list || !dragId) return null;

    const rows = Array.from(
      list.querySelectorAll<HTMLLIElement>("[data-task-id]"),
    );

    for (const row of rows) {
      const id = row.dataset.taskId;
      if (!id) continue;

      const rect = row.getBoundingClientRect();
      const isBeforeMidpoint = clientY < rect.top + rect.height / 2;

      if (isBeforeMidpoint) {
        return id === dragId ? null : { id, pos: "before" };
      }
    }

    const lastRow = rows.at(-1);
    const lastId = lastRow?.dataset.taskId;
    if (!lastId || lastId === dragId) return null;

    return { id: lastId, pos: "after" };
  }

  function handleListDragOver(e: React.DragEvent<HTMLUListElement>) {
    if (!dragId || tasks.length === 0) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    scrollListNearEdge(e.clientY);
    setDropIntent(getDropIntent(e.clientY));
  }

  function handleListDrop(e: React.DragEvent<HTMLUListElement>) {
    if (!dragId) return;

    e.preventDefault();
    const intent = getDropIntent(e.clientY) ?? dragOverRef.current;

    if (intent && dragId !== intent.id) {
      onMove(dragId, intent.id, intent.pos);
    }
    setDragId(null);
    setDropIntent(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setDropIntent(null);
  }

  return (
    <Window
      title="◆ to-do.txt"
      accent="cyan"
      className="w-full h-full flex flex-col"
      bodyClassName="flex-1 min-h-0 flex flex-col"
    >
      <form onSubmit={submit} className="flex gap-2 shrink-0">
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

      <ul
        ref={listRef}
        onDragOver={handleListDragOver}
        onDrop={handleListDrop}
        className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto pt-3 pr-1"
      >
        {tasks.length === 0 && (
          <li className="text-mauve font-mono text-base text-center py-4 opacity-70">
            ~ no tasks yet ~
          </li>
        )}
        {tasks.map((task) => {
          const isEditing = editingId === task.id;
          const isDragging = dragId === task.id;
          const showBefore =
            !isDragging &&
            dragOver?.id === task.id &&
            dragOver.pos === "before";
          const showAfter =
            !isDragging &&
            dragOver?.id === task.id &&
            dragOver.pos === "after";
          return (
            <Fragment key={task.id}>
              {showBefore && (
                <li
                  className="h-0.5 bg-cyan -my-0.5 list-none"
                  aria-hidden
                />
              )}
              <li
                data-task-id={task.id}
                draggable={!isEditing}
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-2 group bevel-in bg-night px-2 py-1.5
                  ${isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing select-none"}
                  ${isDragging ? "opacity-40" : ""}
                `}
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
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    onBlur={() => commitRename(task)}
                    onKeyDown={(e) => handleRenameKeyDown(e, task)}
                    maxLength={120}
                    className="
                      flex-1 bevel-in bg-night-deep text-cream
                      px-2 py-1 font-mono text-base
                      focus:outline-none focus:text-cyan
                      min-w-0
                    "
                    aria-label="rename task"
                  />
                ) : (
                  <span
                    className={`
                      flex-1 font-mono text-base break-words min-w-0
                      ${task.done ? "line-through text-mauve opacity-60" : "text-cream"}
                    `}
                  >
                    {task.text}
                  </span>
                )}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startRename(task)}
                    className="
                      shrink-0 font-pixel text-[8px] text-mauve
                      opacity-0 group-hover:opacity-100 hover:text-cyan
                      cursor-pointer transition-opacity
                    "
                    aria-label="rename task"
                  >
                    edit
                  </button>
                )}
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
              {showAfter && (
                <li
                  className="h-0.5 bg-cyan -my-0.5 list-none"
                  aria-hidden
                />
              )}
            </Fragment>
          );
        })}
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
