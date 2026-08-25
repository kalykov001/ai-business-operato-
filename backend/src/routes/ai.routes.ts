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

    const userId = req.user.id;
    const googleToken = req.user.googleToken; // проверьте точное имя поля в вашем authMiddleware

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

export default router;