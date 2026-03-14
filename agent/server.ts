import "dotenv/config";
import { createServer, type IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import type { UIMessage } from "ai";
import { createAgentChatResponse } from "./chat-runtime.ts";
import { getTask, listTasks } from "./task-store.ts";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? "8787");
const agentServiceApiKey = process.env.AGENT_SERVICE_API_KEY;

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  res: import("node:http").ServerResponse,
) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
  }
  return data;
}

const server = createServer(async (req, res) => {
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? `${host}:${port}`}`,
  );

  if (req.method === "GET" && url.pathname === "/health") {
    return jsonResponse(200, { ok: true }, res);
  }

  // GET /api/tasks — list all tasks
  if (req.method === "GET" && url.pathname === "/api/tasks") {
    if (agentServiceApiKey) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${agentServiceApiKey}`) {
        return jsonResponse(401, { error: "Unauthorized" }, res);
      }
    }
    const tasks = listTasks().map((t) => ({
      id: t.id,
      status: t.status,
      query: t.query,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    }));
    return jsonResponse(200, { tasks }, res);
  }

  // GET /api/tasks/:id — get a specific task
  const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (req.method === "GET" && taskMatch) {
    if (agentServiceApiKey) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${agentServiceApiKey}`) {
        return jsonResponse(401, { error: "Unauthorized" }, res);
      }
    }
    const task = getTask(taskMatch[1]);
    if (!task) {
      return jsonResponse(404, { error: "Task not found" }, res);
    }
    return jsonResponse(200, { task }, res);
  }

  if (req.method !== "POST" || url.pathname !== "/api/chat") {
    return jsonResponse(404, { error: "Not found" }, res);
  }

  if (agentServiceApiKey) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${agentServiceApiKey}`) {
      return jsonResponse(401, { error: "Unauthorized" }, res);
    }
  }

  let body: unknown;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" }, res);
  }

  const maybeMessages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(maybeMessages)) {
    return jsonResponse(400, {
      error: "Invalid payload: expected { messages: UIMessage[] }",
    }, res);
  }

  try {
    const upstreamResponse = await createAgentChatResponse(
      maybeMessages as UIMessage[],
    );

    res.statusCode = upstreamResponse.status;
    upstreamResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    if (!upstreamResponse.body) {
      res.end();
      return;
    }

    Readable.fromWeb(
      upstreamResponse.body as unknown as ReadableStream<Uint8Array>,
    ).pipe(res);
  } catch (error) {
    console.error("Agent service error:", error);
    jsonResponse(500, { error: "Failed to process chat request" }, res);
  }
});

server.listen(port, host, () => {
  console.log(`Agent service listening on http://${host}:${port}`);
});
