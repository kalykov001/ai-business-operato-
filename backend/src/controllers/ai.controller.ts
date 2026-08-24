import { Request, Response } from "express";
import { askGemini } from "../services/ai.service";

export async function chatWithAI(req: Request, res: Response) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const googleToken = req.headers["x-google-provider-token"];

    if (typeof googleToken !== "string") {
      return res.status(401).json({
        error: "Google provider token is missing",
      });
    }

    const answer = await askGemini(message, req.user.id, googleToken);

    return res.json({
      answer,
    });
  } catch (error) {
    console.error("AI error:", error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to communicate with AI",
    });
  }
}
