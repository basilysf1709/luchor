import { pgTable, text, integer, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const tokenUsage = pgTable("token_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_token_usage_user_period").on(table.userId, table.createdAt),
]);
