import { Request, Response } from "express";

import {
  getCalendarEvents,
  createCalendarEvent,
} from "../services/calendar.service";


// ===============================
// GET EVENTS
// ===============================




// ===============================
// CREATE EVENT
// ===============================

export const createCalendarEventController = async (
  req: Request,
  res: Response,
) => {
  try {
    const googleToken =
      req.headers["x-google-provider-token"];

    if (
      !googleToken ||
      typeof googleToken !== "string"
    ) {
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

    if (!summary) {
      return res.status(400).json({
        error: "Event title is required",
      });
    }

    if (!start) {
      return res.status(400).json({
        error: "Event start is required",
      });
    }

    if (!end) {
      return res.status(400).json({
        error: "Event end is required",
      });
    }

    const event =
      await createCalendarEvent(
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
  } catch (error: any) {
    console.error(
      "Create calendar event error:",
      error,
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
};