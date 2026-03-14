"use client";

import { useState, useEffect, useCallback } from "react";

export const TASK_HISTORY_CHANGED_EVENT = "task-history:changed";

export interface Task {
  id: string;
  status: "running" | "completed" | "failed";
  query: string;
  title: string | null;
  createdAt: number;
  completedAt: number | null;
  updatedAt: number;
}

export function notifyTaskHistoryChanged() {
  window.dispatchEvent(new Event(TASK_HISTORY_CHANGED_EVENT));
}

export function useTaskHistory(pollInterval = 3000) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      // silently ignore fetch errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const id = setInterval(fetchTasks, pollInterval);
    const handleHistoryChanged = () => {
      void fetchTasks();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchTasks();
      }
    };

    window.addEventListener(TASK_HISTORY_CHANGED_EVENT, handleHistoryChanged);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(id);
      window.removeEventListener(TASK_HISTORY_CHANGED_EVENT, handleHistoryChanged);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchTasks, pollInterval]);

  const renameTask = useCallback(
    async (id: string, title: string) => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, title } : t)),
          );
          notifyTaskHistoryChanged();
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (res.ok) {
          setTasks((prev) => prev.filter((t) => t.id !== id));
          notifyTaskHistoryChanged();
          return true;
        }
      } catch {
        // ignore
      }

      return false;
    },
    [],
  );

  return { tasks, isLoading, refetch: fetchTasks, renameTask, deleteTask };
}
