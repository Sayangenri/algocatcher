import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scores = pgTable("algoscores", {
  id: serial("id").primaryKey(),
  wallet: text("wallet").notNull().unique(),
  score: integer("score").notNull().default(0),
});

// ✅ Insert schema must match table
export const insertScoreSchema = createInsertSchema(scores).pick({
  wallet: true,
  score: true,
});

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;