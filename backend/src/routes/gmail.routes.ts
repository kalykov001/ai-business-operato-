import { Router } from "express";
import { getGmailMessages } from "../controllers/gmail.controller";

const router = Router();

router.get("/messages", getGmailMessages);

export default router;