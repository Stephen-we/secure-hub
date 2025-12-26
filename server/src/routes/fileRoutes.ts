import { Router } from "express";
import path from "path";
import fs from "fs";
import requestIp from "request-ip";

import { upload } from "../config/multer";
import File from "../models/File";
import DownloadLog from "../models/DownloadLog";
import auth from "../middleware/auth";
import { getOnlyOfficeConfig } from "../controllers/onlyofficeController";

const router = Router();

/**
 * Normalize ALL file documents (old + new formats)
 */
function normalize(file: any) {
  return {
    _id: file._id,

    // name fallback
    name: file.name || file.fileName || "Unnamed",

    // stored name fallback
    storedName: file.storedName || file.filePath || "",

    // size fallback
    size: file.size || 0,

    // type fallback
    type: file.type || file.fileType || "unknown",

    uploadedBy: file.uploadedBy || file.sender || null,
    receiverType: file.receiverType || null,
    receiverDepartment: file.receiverDepartment || null,
    receiverUser: file.receiverUser || null,

    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}

/**
 * GET /api/files
 * List all files (normalized)
 */
router.get("/", auth, async (req: any, res) => {
  const files = await File.find().sort({ createdAt: -1 });

  const normalizedFiles = files.map((f) => normalize(f));

  res.json(normalizedFiles);
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
    file: normalize(file),
  });
});

/**
 * GET /api/files/:id/download
 * Download a file + log the download
 */

router.get("/onlyoffice/:fileId", auth, getOnlyOfficeConfig);

router.get("/:id/download", auth, async (req: any, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const final = normalize(file);

    const filePath = path.join(process.cwd(), "uploads", final.storedName);

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
    res.download(filePath, final.name);
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

    const final = normalize(file);
    const filePath = path.join(process.cwd(), "uploads", final.storedName);

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
 * GET /api/files/logs/all
 * Download logs (admin only)
 */
router.get("/logs/all", auth, async (req: any, res) => {
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
