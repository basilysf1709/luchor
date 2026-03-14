"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import type { UIMessage } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { Thread } from "@/components/assistant-ui/thread";
import { WorkspacePanel } from "@/components/chat/workspace-panel";
import { notifyTaskHistoryChanged } from "@/hooks/use-task-history";

type PersistedSessionStatus = "completed" | "failed";

function useSessionMessages(sessionId: string) {
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);

      try {
        const res = await fetch(`/api/tasks/${sessionId}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setInitialMessages(undefined);
          return;
        }
        const data = await res.json();
        if (!cancelled && Array.isArray(data.messages) && data.messages.length > 0) {
          setInitialMessages(data.messages);
        } else {
          setInitialMessages(undefined);
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setInitialMessages(undefined);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sessionId]);

  return { initialMessages, isLoading };
}

export function ChatPage({
  onStartNewSession,
  sessionId,
}: {
  onStartNewSession?: () => void;
  sessionId: string;
}) {
  const { initialMessages, isLoading } = useSessionMessages(sessionId);

  if (isLoading) return null;

  return (
    <ChatPageInner
      initialMessages={initialMessages}
      onStartNewSession={onStartNewSession}
      sessionId={sessionId}
    />
  );
}

function ChatPageInner({
  sessionId,
  initialMessages,
  onStartNewSession,
}: {
  sessionId: string;
  initialMessages?: UIMessage[];
  onStartNewSession?: () => void;
}) {
  const persistSessionSnapshot = useCallback(
    async (messages: UIMessage[], status: PersistedSessionStatus) => {
      if (messages.length === 0) {
        return;
      }

      try {
        const res = await fetch(`/api/tasks/${sessionId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages,
            status,
          }),
          keepalive: true,
        });

        if (!res.ok) {
          return;
        }

        notifyTaskHistoryChanged();
      } catch {
        // ignore best-effort persistence errors
      }
    },
    [sessionId],
  );

  const transport = useMemo(
    () => new AssistantChatTransport({ body: { sessionId } }),
    [sessionId],
  );

  const runtime = useChatRuntime({
    messages: initialMessages,
    onFinish: ({ isDisconnect, isError, messages }) => {
      const status: PersistedSessionStatus =
        isError || isDisconnect ? "failed" : "completed";

      void persistSessionSnapshot(messages, status);
    },
    transport,
  });
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
          <Thread onStartNewSession={onStartNewSession} />
        </div>
        <WorkspacePanel
          isExpanded={isWorkspaceExpanded}
          onExpandedChange={setIsWorkspaceExpanded}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}
