import { Router } from "express";
import { getDriveFiles } from "../controllers/drive.controller";

const router = Router();

router.get("/files", getDriveFiles);

export default router;