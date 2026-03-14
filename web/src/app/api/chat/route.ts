export const runtime = "nodejs";

import { after } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { UIMessage } from "ai";
import { and, eq } from "drizzle-orm";
import db from "@/lib/db";
import { tokenUsage, sessionHistory } from "@/lib/db/schema";
import { createAgentToken } from "@/lib/agent-token";

type SessionStatus = "running" | "completed" | "failed";

function getFirstUserMessageText(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage) {
    return "";
  }

  const textPart = firstUserMessage.parts?.find((part) => part.type === "text");
  if (textPart?.type === "text") {
    return textPart.text.trim();
  }

  return "";
}

export async function POST(req: Request) {
  const agentServiceChatUrl = process.env.AGENT_SERVICE_CHAT_URL;

  if (!agentServiceChatUrl) {
    return Response.json(
      {
        error:
          "AGENT_SERVICE_CHAT_URL is not set. Configure it to the deployed agent chat endpoint.",
      },
      { status: 500 },
    );
  }

  const isDevEnvironment =
    process.env.NEXT_PUBLIC_ENV === "dev" ||
    process.env.NODE_ENV === "development";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!isDevEnvironment && !session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const DEV_USER_ID = "dev-local-user";
  const userId = session?.user?.id ?? (isDevEnvironment ? DEV_USER_ID : null);

  const contentType = req.headers.get("content-type") ?? "application/json";
  const body = await req.text();
  let requestMessages: UIMessage[] = [];

  let sessionRecordId: string | null = null;
  try {
    const parsed = JSON.parse(body);
    sessionRecordId = parsed.sessionId ?? null;
    requestMessages = Array.isArray(parsed.messages) ? parsed.messages : [];

    if (userId && sessionRecordId && requestMessages.length > 0) {
      const query = getFirstUserMessageText(requestMessages);

      const existing = await db.query.sessionHistory.findFirst({
        where: and(
          eq(sessionHistory.id, sessionRecordId),
          eq(sessionHistory.userId, userId),
        ),
      });

      if (!existing) {
        await db.insert(sessionHistory).values({
          id: sessionRecordId,
          userId,
          query,
          title: query.length > 100 ? query.slice(0, 100) : query,
          messages: requestMessages,
          status: "running",
          completedAt: null,
          updatedAt: new Date(),
        });
      } else {
        await db
          .update(sessionHistory)
          .set({
            messages: requestMessages,
            status: "running",
            completedAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(sessionHistory.id, sessionRecordId),
              eq(sessionHistory.userId, userId),
            ),
          );
      }
    }
  } catch (err) {
    console.error("[session-history] Failed to save:", err);
  }

  const upstreamHeaders = new Headers({ "content-type": contentType });
  const apiKey = process.env.AGENT_SERVICE_API_KEY;
  if (apiKey) {
    upstreamHeaders.set("authorization", `Bearer ${apiKey}`);
  }
  if (userId && process.env.AGENT_AUTH_SECRET) {
    try {
      const agentToken = await createAgentToken(userId);
      upstreamHeaders.set("x-agent-token", agentToken);
    } catch (err) {
      console.error("[api/chat] Failed to create agent token:", err);
    }
  }

  try {
    const upstream = await fetch(agentServiceChatUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body,
    });

    const updateSessionStatus = async (status: SessionStatus) => {
      if (!sessionRecordId || !userId) {
        return;
      }

      try {
        await db
          .update(sessionHistory)
          .set({
            status,
            completedAt: status === "running" ? null : new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(sessionHistory.id, sessionRecordId),
              eq(sessionHistory.userId, userId),
            ),
          );
      } catch (err) {
        console.error("[session-history] Failed to update status:", err);
      }
    };

    if (!upstream.body || !userId) {
      await updateSessionStatus(upstream.ok ? "completed" : "failed");
      return new Response(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
      });
    }

    const usage = { promptTokens: 0, completionTokens: 0 };
    let partial = "";
    const decoder = new TextDecoder();
    let resolveStreamDone!: () => void;
    const streamDone = new Promise<void>((r) => { resolveStreamDone = r; });

    const tap = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        controller.enqueue(chunk);

        const text = decoder.decode(chunk, { stream: true });
        partial += text;

        const lines = partial.split("\n");
        // Keep the last element — it may be an incomplete line
        partial = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("g:")) continue;
          try {
            const payload = JSON.parse(line.slice(2));
            if (payload?.usage) {
              usage.promptTokens += payload.usage.promptTokens ?? 0;
              usage.completionTokens += payload.usage.completionTokens ?? 0;
            }
          } catch {
            // Not valid JSON — skip
          }
        }
      },

      flush() {
        // Flush any remaining bytes from the decoder
        partial += decoder.decode();

        // Process any remaining partial line
        if (partial.startsWith("g:")) {
          try {
            const payload = JSON.parse(partial.slice(2));
            if (payload?.usage) {
              usage.promptTokens += payload.usage.promptTokens ?? 0;
              usage.completionTokens += payload.usage.completionTokens ?? 0;
            }
          } catch {
            // ignore
          }
        }

        resolveStreamDone();
      },
    });

    // Register after() in the request handler context so it reliably
    // survives response completion, then await the stream inside it.
    after(async () => {
      await streamDone;
      const totalTokens = usage.promptTokens + usage.completionTokens;
      if (totalTokens > 0 && userId) {
        try {
          await db.insert(tokenUsage).values({
            userId,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens,
          });
        } catch (err) {
          console.error("[usage] Failed to insert token usage:", err);
        }
      }
      await updateSessionStatus(upstream.ok ? "completed" : "failed");
    });

    const tappedStream = upstream.body.pipeThrough(tap);

    return new Response(tappedStream, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch (error) {
    console.error("Agent service proxy error:", error);
    if (sessionRecordId && userId) {
      try {
        await db
          .update(sessionHistory)
          .set({
            messages: requestMessages,
            status: "failed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(sessionHistory.id, sessionRecordId),
              eq(sessionHistory.userId, userId),
            ),
          );
      } catch (err) {
        console.error("[session-history] Failed to mark failed session:", err);
      }
    }

    return Response.json(
      { error: "Failed to reach agent service." },
      { status: 502 },
    );
  }
}
