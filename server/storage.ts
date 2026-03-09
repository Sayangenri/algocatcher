import { db } from "./db";
import { scores, type Score } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export class DatabaseStorage {
async getTopScores(): Promise<Score[]> {
  return db.select().from(scores).orderBy(desc(scores.score));
}

  async createOrUpdateScore(wallet: string, newScore: number): Promise<Score> {
    const existing = await db
      .select()
      .from(scores)
      .where(eq(scores.wallet, wallet));

    // If wallet exists
    if (existing.length > 0) {
      const currentScore = existing[0];

      // 🔥 Compare scores
      if (newScore > currentScore.score) {
        const [updated] = await db
          .update(scores)
          .set({ score: newScore })
          .where(eq(scores.wallet, wallet))
          .returning();

        return updated;
      }

      // If new score is lower → keep old
      return currentScore;
    }

    // If wallet does NOT exist → create
    const [created] = await db
      .insert(scores)
      .values({ wallet, score: newScore })
      .returning();

    return created;
  }
}

export const storage = new DatabaseStorage();