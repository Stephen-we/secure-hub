// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import requestIp from "request-ip";
import macaddress from "macaddress";
import jwt from "jsonwebtoken";
import path from "path";
import User from "./models/User";

// ROUTES
import authRoutes from "./routes/authRoutes";
import fileRoutes from "./routes/fileRoutes";
import chatRoutes from "./routes/chatRoutes";
import userRoutes from "./routes/userRoutes";

// ✅ 1. Load .env FIRST
dotenv.config();

// ✅ 2. Create app BEFORE using it
const app = express();

// ✅ 3. Core middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 🔹 serve raw files (optional for debug / direct links)
app.use("/uploads", express.static("uploads"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

// ✅ 4. Logging middleware (runs for all requests)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = requestIp.getClientIp(req);
    const mac = await macaddress.one();

    console.log("Request Received =>", {
      ip,
      mac,
      path: req.originalUrl,
      method: req.method,
    });

    next();
  } catch (error) {
    console.error("IP/MAC Logging Error:", error);
    next();
  }
});

// ✅ 5. Static uploads folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// ✅ 6. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

// ✅ 7. Simple health check
app.get("/", (req: Request, res: Response) => {
  res.send("SecureHub Server Running...");
});

// ✅ 8. HTTP + Socket.io server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Expose io to controllers if needed
app.set("io", io);

// ✅ 9. Socket.io auth + rooms
io.on("connection", async (socket) => {
  console.log("New socket trying to connect:", socket.id);

  try {
    const token =
      (socket.handshake.auth &&
        (socket.handshake.auth as any).token) ||
      (socket.handshake.query &&
        (socket.handshake.query.token as string));

    if (!token) {
      console.log("No token in socket, disconnecting:", socket.id);
      socket.disconnect();
      return;
    }

    const decoded: any = jwt.verify(
      token as string,
      process.env.JWT_SECRET!
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("User not found for socket, disconnecting:", socket.id);
      socket.disconnect();
      return;
    }

    socket.join(`user:${user._id.toString()}`);
    socket.join(`department:${user.department}`);
    socket.join("everyone");

    console.log(
      `Socket ${socket.id} connected for user ${user.email} in rooms: user:${user._id}, department:${user.department}`
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  } catch (err) {
    console.error("Socket auth error:", err);
    socket.disconnect();
  }
});

// ✅ 10. MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo Error:", err));

// ✅ 11. Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
