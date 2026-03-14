"use client";

import { useState } from "react";
import { ChevronDown, Ellipsis, Pencil, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskHistory, type Task } from "@/hooks/use-task-history";

function TaskItem({
  isActive,
  task,
  onDeleteSession,
  onRename,
  onDelete,
  onSelect,
}: {
  isActive: boolean;
  task: Task;
  onDeleteSession?: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => Promise<boolean>;
  onSelect?: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title ?? task.query);
  const label = task.title?.trim() || task.query.trim() || "Untitled chat";

  const handleRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== label) {
      onRename(task.id, trimmed);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRename();
          if (e.key === "Escape") setIsEditing(false);
        }}
        className="w-full rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-sm text-sidebar-foreground outline-none"
      />
    );
  }

  return (
    <div
      className={`group/task flex items-center rounded-lg text-sm ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left"
        onClick={() => onSelect?.(task.id)}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            task.status === "failed"
              ? "bg-red-500"
              : task.status === "running"
                ? "bg-amber-500"
                : "bg-screamin-green-700"
          }`}
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-1 shrink-0 rounded p-0.5 opacity-0 hover:bg-sidebar-accent group-hover/task:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              setEditValue(task.title ?? task.query);
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              const deleted = await onDelete(task.id);
              if (deleted) {
                onDeleteSession?.(task.id);
              }
            }}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type TaskHistoryProps = {
  activeSessionId?: string | null;
  onDeleteSession?: (id: string) => void;
  onSelectSession?: (id: string) => void;
};

export function TaskHistory({
  activeSessionId,
  onDeleteSession,
  onSelectSession,
}: TaskHistoryProps) {
  const { tasks, renameTask, deleteTask } = useTaskHistory();

  if (tasks.length === 0) return null;

  return (
    <SidebarGroup>
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="cursor-pointer">
            Task History
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <div className="flex flex-col gap-0.5 px-2 pt-1">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  isActive={task.id === activeSessionId}
                  task={task}
                  onDeleteSession={onDeleteSession}
                  onRename={renameTask}
                  onDelete={deleteTask}
                  onSelect={onSelectSession}
                />
              ))}
            </div>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
