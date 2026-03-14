import { randomUUID } from "node:crypto";

export type TaskStatus = "running" | "completed" | "failed";

export interface Task {
  id: string;
  status: TaskStatus;
  query: string;
  result: string | null;
  error: string | null;
  createdAt: number;
  completedAt: number | null;
}

const tasks = new Map<string, Task>();

export function createTask(query: string): Task {
  const task: Task = {
    id: randomUUID(),
    status: "running",
    query,
    result: null,
    error: null,
    createdAt: Date.now(),
    completedAt: null,
  };
  tasks.set(task.id, task);
  return task;
}

export function completeTask(id: string, result: string): void {
  const task = tasks.get(id);
  if (!task) return;
  task.status = "completed";
  task.result = result;
  task.completedAt = Date.now();
}

export function failTask(id: string, error: string): void {
  const task = tasks.get(id);
  if (!task) return;
  task.status = "failed";
  task.error = error;
  task.completedAt = Date.now();
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

export function listTasks(): Task[] {
  return Array.from(tasks.values());
}
