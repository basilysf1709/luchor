"use client";

import { useMessage } from "@assistant-ui/react";

export function AgentIndicator() {
  const agentName = useMessage((m) => {
    if (m.role !== "assistant") return null;
    const metadata = m.metadata as Record<string, unknown> | undefined;
    if (typeof metadata?.agentName === "string") {
      return metadata.agentName;
    }
    const custom = metadata?.custom as Record<string, unknown> | undefined;
    if (typeof custom?.agentName === "string") {
      return custom.agentName;
    }
    return null;
  });

  if (!agentName) return null;

  return (
    <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-screamin-green-200 bg-screamin-green-50 px-2 py-0.5 text-xs font-medium text-screamin-green-800">
      {agentName}
    </span>
  );
}
