import { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "../config/supabase";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header is missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid Authorization header",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Access token is missing",
      });
    }

    console.log("AUTH TOKEN RECEIVED:", !!token);

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error) {
      console.error("SUPABASE AUTH ERROR:", error);

      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    console.log("AUTH USER:", user.id);

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      message: "Authentication error",
    });
  }
};