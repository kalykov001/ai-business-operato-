import { Router } from "express";
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from "../services/calendar.service";

const router = Router();

// GET events
router.get("/events", async (req, res) => {
  try {
    const googleToken =
      req.headers["x-google-provider-token"];

    if (typeof googleToken !== "string") {
      return res.status(401).json({
        error: "Google provider token is missing",
      });
    }

    const events = await getCalendarEvents(googleToken);

    return res.json({
      events,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to get calendar events",
    });
  }
});

// CREATE event
router.post("/events", async (req, res) => {
  try {
    const googleToken =
      req.headers["x-google-provider-token"];

    if (typeof googleToken !== "string") {
      return res.status(401).json({
        error: "Google provider token is missing",
      });
    }

    const {
      summary,
      description,
      start,
      end,
    } = req.body;

    if (!summary || !start || !end) {
      return res.status(400).json({
        error: "summary, start and end are required",
      });
    }

    const event = await createCalendarEvent(
      googleToken,
      {
        summary,
        description,
        start,
        end,
      },
    );

    return res.status(201).json({
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to create calendar event",
    });
  }
});

// DELETE event
router.delete("/events/:eventId", async (req, res) => {
  try {
    const googleToken =
      req.headers["x-google-provider-token"];

    if (typeof googleToken !== "string") {
      return res.status(401).json({
        error: "Google provider token is missing",
      });
    }

    const { eventId } = req.params;

    await deleteCalendarEvent(
      googleToken,
      eventId,
    );

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to delete calendar event",
    });
  }
});

export default router;