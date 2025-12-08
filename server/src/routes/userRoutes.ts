import { Router } from "express";
import authMiddleware from "../middleware/auth";
import { getAllUsers } from "../controllers/userController";

const router = Router();

// Get all users (for chat sidebar)
router.get("/", authMiddleware, getAllUsers);

export default router;
