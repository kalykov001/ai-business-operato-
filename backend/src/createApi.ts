import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import calendarRouter from "./routes/calendar.routes";
import gmailRouter from "./routes/gmail.routes";
import notesRouter from "./routes/notes.routes";
import driveRouter from "./routes/drive.routes";
import aiRoutes from "./routes/ai.routes";
const createApi = () => {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Google-Provider-Token",
      ],
    }),
  );
  app.use(express.json());
  app.use("/api/calendar", calendarRouter);

  app.use("/api/auth", authRouter);
  app.use("/api/gmail", gmailRouter);
  app.use("/api/drive", driveRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/ai", aiRoutes);
  return app;
};

export default createApi;
