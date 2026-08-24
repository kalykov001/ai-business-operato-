import { Request, Response } from "express";
import { getGmailMessagesService } from "../services/gmail.service";

export const getGmailMessages = async (
  req: Request,
  res: Response
) => {
  try {
    const providerToken =
      req.headers["x-google-provider-token"];

    if (
      !providerToken ||
      typeof providerToken !== "string"
    ) {
      return res.status(401).json({
        message: "Google provider token is missing",
      });
    }

    const pageToken =
      typeof req.query.pageToken === "string"
        ? req.query.pageToken
        : undefined;

    const result =
      await getGmailMessagesService(
        providerToken,
        pageToken
      );

    return res.json(result);
  } catch (error: any) {
    console.error(
      "Gmail API error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Failed to get Gmail messages",
      error:
        error.response?.data ||
        error.message,
    });
  }
};