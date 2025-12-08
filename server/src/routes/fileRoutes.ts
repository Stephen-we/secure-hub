import { Router } from "express";
import path from "path";
import fs from "fs";
import requestIp from "request-ip";

import { upload } from "../config/multer";
import File from "../models/File";
import DownloadLog from "../models/DownloadLog";
import auth from "../middleware/auth";

const router = Router();

/**
 * GET /api/files
 * List all files (later we can filter by department/user)
 */
router.get("/", auth, async (req: any, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

/**
 * POST /api/files/upload
 * Upload file
 */
router.post("/upload", auth, upload.single("file"), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const file = await File.create({
    name: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size,
    type: req.file.mimetype,
    uploadedBy: req.user.id,
  });

  res.json({
    message: "File uploaded successfully",
    file,
  });
});

/**
 * GET /api/files/:id/download
 * Download a file + log the download
 */
router.get("/:id/download", auth, async (req: any, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const filePath = path.join(process.cwd(), "uploads", file.storedName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    // Log download
    await DownloadLog.create({
      fileId: file._id,
      userId: req.user.id,
      deviceId: req.headers["x-device-id"] || null,
      ipAddress: requestIp.getClientIp(req),
      userAgent: req.headers["user-agent"],
    });

    // Stream file
    res.download(filePath, file.name);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Download failed" });
  }
});

/**
 * DELETE /api/files/:id
 * Only admin can delete files
 */
router.delete("/:id", auth, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete files" });
    }

    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const filePath = path.join(process.cwd(), "uploads", file.storedName);

    await File.deleteOne({ _id: file._id });

    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file from disk:", err);
    });

    res.json({ message: "File deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/**
 * GET /api/files/logs
 * Download logs (we'll use this later for Logs page)
 */
router.get("/logs/all", auth, async (req: any, res) => {
  // optional: restrict to admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can view logs" });
  }

  const logs = await DownloadLog.find()
    .populate("fileId", "name")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(logs);
});

export default router;

