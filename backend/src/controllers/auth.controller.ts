import { Request, Response } from "express";

export const getAuth = (req: Request, res: Response) => {
  res.json({
    user: req.user,
  });
};