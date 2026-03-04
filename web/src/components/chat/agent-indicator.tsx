"use client";

import { useMessage } from "@assistant-ui/react";

export function AgentIndicator() {
  const agentName = useMessage((m) => {
    if (m.role !== "assistant") return null;
    // Metadata from the AI SDK stream is stored in metadata.custom
    return (m.metadata?.custom as Record<string, unknown> | undefined)
      ?.agentName as string | undefined;
  });

  if (!agentName) return null;

  return (
    <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-screamin-green-200 bg-screamin-green-50 px-2 py-0.5 text-xs font-medium text-screamin-green-800">
      {agentName}
    </span>
  );
}
