import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { askGemini } from "../services/ai.service";

const router = Router();

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const googleToken =
      req.headers["x-google-provider-token"] as string | undefined;

    console.log("=================================");
    console.log("AI CHAT REQUEST");
    console.log("USER ID:", userId);
    console.log("MESSAGE:", message);
    console.log("HAS GOOGLE TOKEN:", !!googleToken);
    console.log("=================================");

    const answer = await askGemini(
      message,
      userId,
      googleToken ?? "",
    );

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("AI CHAT ROUTER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to process AI request",
    });
  }
});

export default router;