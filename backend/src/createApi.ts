import "dotenv/config";

import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.routes";
import calendarRouter from "./routes/calendar.routes";
import gmailRouter from "./routes/gmail.routes";
import notesRouter from "./routes/notes.routes";
import driveRouter from "./routes/drive.routes";
import aiRoutes from "./routes/ai.routes";

const allowedOrigins = [
  "http://localhost:3000",
  "https://ai-business-operator-omega.vercel.app",
];

const createApi = () => {
  const app = express();

  console.log("🔥 createApi() CREATED");

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.error("❌ CORS BLOCKED:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },

      credentials: true,

      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Google-Provider-Token",
      ],
    }),
  );

  app.use(express.json());

  // =========================
  // HEALTH
  // =========================

  app.get("/health", (_req, res) => {
    console.log("🔥 HEALTH REQUEST");

    res.status(200).json({
      success: true,
      message: "Backend is working",
    });
  });

  // =========================
  // ROUTES
  // =========================

  app.use("/api/auth", authRouter);

  app.use("/api/calendar", calendarRouter);

  app.use("/api/gmail", gmailRouter);

  app.use("/api/drive", driveRouter);

  app.use("/api/notes", notesRouter);

  app.use("/api/ai", aiRoutes);

  console.log("🔥 AI ROUTES REGISTERED");

  return app;
};

export default createApi;