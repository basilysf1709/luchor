import { pgTable, text, integer, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";

export const sessionHistory = pgTable("session_history", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title"),
  query: text("query").notNull(),
  status: text("status").notNull().default("running"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
  messages: jsonb("messages").default([]),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("session_history_userId_idx").on(table.userId),
  index("session_history_createdAt_idx").on(table.createdAt),
]);

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
