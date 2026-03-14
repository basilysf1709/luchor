export const runtime = "nodejs";

import { after } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { tokenUsage } from "@/lib/db/schema";

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

  let userId: string | null = null;

  if (!isDevEnvironment) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
  }

  const contentType = req.headers.get("content-type") ?? "application/json";
  const body = await req.text();
  const upstreamHeaders = new Headers({ "content-type": contentType });
  const apiKey = process.env.AGENT_SERVICE_API_KEY;
  if (apiKey) {
    upstreamHeaders.set("authorization", `Bearer ${apiKey}`);
  }

  try {
    const upstream = await fetch(agentServiceChatUrl, {
      method: "POST",
      headers: upstreamHeaders,
      body,
    });

    if (!upstream.body || !userId) {
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
    });

    const tappedStream = upstream.body.pipeThrough(tap);

    return new Response(tappedStream, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch (error) {
    console.error("Agent service proxy error:", error);
    return Response.json(
      { error: "Failed to reach agent service." },
      { status: 502 },
    );
  }
}
