"use client";

import { useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { cn } from "@/lib/utils";
import { Thread } from "@/components/assistant-ui/thread";
import { WorkspacePanel } from "@/components/chat/workspace-panel";

export function ChatPage() {
  const runtime = useChatRuntime();
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1",
            isWorkspaceExpanded && "hidden lg:hidden",
          )}
        >
          <Thread />
        </div>
        <WorkspacePanel
          isExpanded={isWorkspaceExpanded}
          onExpandedChange={setIsWorkspaceExpanded}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
