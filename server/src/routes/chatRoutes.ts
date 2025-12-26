import { Router } from "express";
import { sendMessage, getChatHistory } from "../controllers/chatController";
import auth from "../middleware/auth";

const router = Router();

router.post("/send", auth, sendMessage);
router.get("/history/:id", auth, getChatHistory);

export default router;
