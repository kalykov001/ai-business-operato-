import { Request, Response } from "express";
import { getDriveFilesService } from "../services/drive.service";

export const getDriveFiles = async (
  req: Request,
  res: Response
) => {
  try {
    const googleToken =
      req.headers["x-google-provider-token"];

    if (
      !googleToken ||
      typeof googleToken !== "string"
    ) {
      return res.status(401).json({
        message: "Google provider token is missing",
      });
    }

    const files = await getDriveFilesService(
      googleToken
    );

    return res.json({
      files,
    });
  } catch (error: any) {
    console.error(
      "Google Drive error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Failed to get Drive files",
      error:
        error.response?.data || error.message,
    });
  }
};