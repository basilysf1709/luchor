export const runtime = "nodejs";

import type { UIMessage } from "ai";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { sessionHistory } from "@/lib/db/schema";

type SessionStatus = "running" | "completed" | "failed";

function isValidStatus(value: unknown): value is SessionStatus {
  return value === "running" || value === "completed" || value === "failed";
}

async function resolveUserId() {
  const isDevEnvironment =
    process.env.NEXT_PUBLIC_ENV === "dev" ||
    process.env.NODE_ENV === "development";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!isDevEnvironment && !session?.user?.id) return null;
  return session?.user?.id ?? (isDevEnvironment ? "dev-local-user" : null);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const row = await db.query.sessionHistory.findFirst({
      where: and(eq(sessionHistory.id, id), eq(sessionHistory.userId, userId)),
    });

    if (!row) return Response.json({ error: "Not found" }, { status: 404 });

    return Response.json({
      id: row.id,
      messages: Array.isArray(row.messages) ? row.messages : [],
      query: row.query,
      status: row.status,
      title: row.title,
    });
  } catch (err) {
    console.error("[tasks] Failed to fetch session:", err);
    return Response.json({ error: "Failed to fetch." }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const updates: {
    completedAt?: Date | null;
    messages?: UIMessage[];
    query?: string;
    status?: SessionStatus;
    title?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if ("title" in body) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    updates.title = body.title.trim();
  }

  if ("query" in body) {
    if (typeof body.query !== "string" || body.query.trim().length === 0) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    updates.query = body.query.trim();
  }

  if ("messages" in body) {
    if (!Array.isArray(body.messages)) {
      return Response.json({ error: "Messages must be an array." }, { status: 400 });
    }

    updates.messages = body.messages as UIMessage[];
  }

  if ("status" in body) {
    if (!isValidStatus(body.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    updates.status = body.status;
    updates.completedAt = body.status === "running" ? null : new Date();
  }

  if (Object.keys(updates).length === 1) {
    return Response.json({ error: "No valid updates provided." }, { status: 400 });
  }

  try {
    const result = await db
      .update(sessionHistory)
      .set(updates)
      .where(and(eq(sessionHistory.id, id), eq(sessionHistory.userId, userId)))
      .returning({ id: sessionHistory.id });

    if (result.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[tasks] Failed to update session:", err);
    return Response.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await db
      .delete(sessionHistory)
      .where(and(eq(sessionHistory.id, id), eq(sessionHistory.userId, userId)))
      .returning({ id: sessionHistory.id });

    if (result.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[tasks] Failed to delete:", err);
    return Response.json({ error: "Failed to delete." }, { status: 500 });
  }
}
