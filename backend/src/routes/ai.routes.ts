import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { askGemini } from "../services/ai.service";

const router = Router();

router.get("/test", (_req, res) => {
  console.log("🔥🔥🔥 AI TEST ROUTE HIT");

  res.json({
    success: true,
    message: "AI route works",
  });
});

router.post("/chat", authMiddleware, async (req, res) => {
  console.log("🔥🔥🔥 CHAT ROUTE REACHED");
  console.log("BODY:", req.body);

  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User is not authenticated",
      });
    }

    const userId = req.user.id;

    const googleTokenHeader =
      req.headers["x-google-provider-token"];

    const googleToken =
      typeof googleTokenHeader === "string"
        ? googleTokenHeader
        : "";

    const answer = await askGemini(message, userId, googleToken);

    return res.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error("❌ CHAT ROUTE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message ?? "Internal server error",
    });
  }
});

router.post("/suggestions", authMiddleware, async (req, res) => {
  console.log("🔥🔥🔥 SUGGESTIONS ROUTE REACHED");

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User is not authenticated",
      });
    }

    const userId = req.user.id;

    const googleTokenHeader =
      req.headers["x-google-provider-token"];

    const googleToken =
      typeof googleTokenHeader === "string"
        ? googleTokenHeader
        : "";

    const prompt =
      "Проанализируй мои текущие задачи, заметки, CRM-контакты, " +
      "письма и события календаря. Дай 3-5 конкретных, кратких " +
      "рекомендаций о том, на что стоит обратить внимание сегодня " +
      "или в ближайшие дни. Отвечай только списком рекомендаций, " +
      "каждая с новой строки, без нумерации и лишних пояснений.";

    const answer = await askGemini(prompt, userId, googleToken);

   const suggestions = answer
  .split("\n")
  .map((line: string) => line.replace(/^[-•\d.]+\s*/, "").trim())
  .filter((line: string) => line.length > 0);

    return res.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error("❌ SUGGESTIONS ROUTE ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error?.message ?? "Internal server error",
    });
  }
});

export default router;