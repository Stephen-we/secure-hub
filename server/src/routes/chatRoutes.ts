import { Router } from "express";
import authMiddleware from "../middleware/auth";
import multer from "multer";
import { sendMessage, getChatHistory } from "../controllers/chatController";

const upload = multer({ dest: "uploads/chat" });

const router = Router();

router.post("/send", authMiddleware, upload.single("attachment"), sendMessage);

router.get("/history/:id", authMiddleware, getChatHistory);

export default router;
