import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.scores.list.path, async (_req, res) => {
    const topScores = await storage.getTopScores();
    res.json(topScores);
  });

  app.post(api.scores.create.path, async (req, res) => {
  try {
    const input = api.scores.create.input.parse(req.body);

    if (!input.wallet || input.score === undefined) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const result = await storage.createOrUpdateScore(
      input.wallet,
      input.score
    );

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join("."),
      });
    }

    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

  return httpServer;
}
