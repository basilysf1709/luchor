export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { tokenUsage } from "@/lib/db/schema";
import { sql, eq, gte, lt, and } from "drizzle-orm";

export async function GET() {
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

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (!userId) {
    return Response.json({ error: "No user context available" }, { status: 400 });
  }

  const conditions = [
    eq(tokenUsage.userId, userId),
    gte(tokenUsage.createdAt, periodStart),
    lt(tokenUsage.createdAt, periodEnd),
  ];

  const result = await db
    .select({
      promptTokens: sql<number>`coalesce(sum(${tokenUsage.promptTokens}), 0)`,
      completionTokens: sql<number>`coalesce(sum(${tokenUsage.completionTokens}), 0)`,
      totalTokens: sql<number>`coalesce(sum(${tokenUsage.totalTokens}), 0)`,
      requestCount: sql<number>`count(*)`,
    })
    .from(tokenUsage)
    .where(and(...conditions));

  const row = result[0];

  return Response.json(
    {
      promptTokens: Number(row.promptTokens),
      completionTokens: Number(row.completionTokens),
      totalTokens: Number(row.totalTokens),
      requestCount: Number(row.requestCount),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
