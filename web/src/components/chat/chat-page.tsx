"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { WorkspacePanel } from "@/components/chat/workspace-panel";

export function ChatPage() {
  const runtime = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1">
          <Thread />
        </div>
        <WorkspacePanel />
      </div>
    </AssistantRuntimeProvider>
  );
}
