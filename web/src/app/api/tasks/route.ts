export const runtime = "nodejs";

import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/db";
import { sessionHistory } from "@/lib/db/schema";

export async function GET() {
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

  if (!userId) {
    return Response.json({ tasks: [] });
  }

  try {
    const rows = await db
      .select()
      .from(sessionHistory)
      .where(eq(sessionHistory.userId, userId))
      .orderBy(desc(sessionHistory.updatedAt))
      .limit(50);

    const tasks = rows.map((row) => ({
      id: row.id,
      status: row.status,
      query: row.query,
      title: row.title,
      createdAt: row.createdAt.getTime(),
      completedAt: row.completedAt?.getTime() ?? null,
      updatedAt: row.updatedAt.getTime(),
    }));

    return Response.json({ tasks });
  } catch (err) {
    console.error("[tasks] Failed to fetch session history:", err);
    return Response.json({ error: "Failed to fetch tasks." }, { status: 500 });
  }
}
