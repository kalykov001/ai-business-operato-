import { Request, Response } from "express";

import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../services/notes.service";

// =========================
// GET ALL NOTES
// GET /api/notes
// =========================

export const getNotesController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    const notes = await getNotes(req.user.id);

    return res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);

    return res.status(500).json({
      message: "Failed to load notes",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};

// =========================
// GET ONE NOTE
// GET /api/notes/:id
// =========================

export const getNoteController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid note id",
      });
    }

    const note = await getNoteById(
      req.user.id,
      id,
    );

    return res.json(note);
  } catch (error) {
    console.error("Get note error:", error);

    return res.status(404).json({
      message: "Note not found",
    });
  }
};

// =========================
// CREATE NOTE
// POST /api/notes
// =========================

export const createNoteController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    const { title, content } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

  const note = await createNote({
  userId: req.user.id,
  title: title.trim(),
  content: content?.trim() || "",
});

    return res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);

    return res.status(500).json({
      message: "Failed to create note",
    });
  }
};

// =========================
// UPDATE NOTE
// PATCH /api/notes/:id
// =========================

export const updateNoteController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid note id",
      });
    }

    const { title, content } = req.body;

    const updates: {
      title?: string;
      content?: string;
    } = {};

    if (typeof title === "string") {
      updates.title = title.trim();
    }

    if (typeof content === "string") {
      updates.content = content;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    const note = await updateNote(
      req.user.id,
      id,
      updates,
    );

    return res.json(note);
  } catch (error) {
    console.error("Update note error:", error);

    return res.status(404).json({
      message: "Note not found",
    });
  }
};

// =========================
// DELETE NOTE
// DELETE /api/notes/:id
// =========================

export const deleteNoteController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid note id",
      });
    }

    await deleteNote(
      req.user.id,
      id,
    );

    return res.json({
      message: "Note deleted successfully",
    });
  }catch (error) {
  console.error("Create note error:", error);

  return res.status(500).json({
    message: "Failed to create note",
    error: error instanceof Error ? error.message : String(error),
  });
}
};