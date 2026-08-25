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
router.post("/chat", (req, res) => {
  console.log("🔥🔥🔥 CHAT ROUTE REACHED");
  console.log("BODY:", req.body);

  res.json({
    success: true,
    answer: "TEST FROM LOCAL BACKEND",
  });
});
router.post("/chat", (req, res) => {
  console.log("🔥🔥🔥 CHAT ROUTE REACHED");
  console.log("BODY:", req.body);

  res.json({
    success: true,
    answer: "TEST FROM LOCAL BACKEND",
  });
});

export default router;