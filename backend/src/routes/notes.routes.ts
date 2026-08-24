import { Router } from "express";

import {
  getNotesController,
  getNoteController,
  createNoteController,
  updateNoteController,
  deleteNoteController,
} from "../controllers/notes.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getNotesController);

router.get("/:id", authMiddleware, getNoteController);

router.post("/", authMiddleware, createNoteController);

router.patch("/:id", authMiddleware, updateNoteController);

router.delete("/:id", authMiddleware, deleteNoteController);

export default router;