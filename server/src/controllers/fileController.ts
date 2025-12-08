import { Request, Response } from "express";
import File from "../models/File";
import DownloadLog from "../models/DownloadLog";
import path from "path";
import requestIp from "request-ip";

export const uploadFile = async (req: any, res: Response) => {
  try {
    const { receiverType, receiverDepartment, receiverUser } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!receiverType) {
      return res
        .status(400)
        .json({ message: "receiverType is required (department | user | everyone)" });
    }

    const newFile = await File.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      size: req.file.size,

      sender: req.user._id,

      receiverType,
      receiverDepartment,
      receiverUser,
    });

    // 🔔 SOCKET NOTIFICATION
    const io = req.app.get("io");
    const payload = {
      fileId: newFile._id,
      fileName: newFile.fileName,
      from: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
      },
      receiverType,
      receiverDepartment,
      receiverUser,
      createdAt: newFile.createdAt,
    };

    if (receiverType === "everyone") {
      io.to("everyone").emit("file:shared", payload);
    } else if (receiverType === "department" && receiverDepartment) {
      io.to(`department:${receiverDepartment}`).emit("file:shared", payload);
    } else if (receiverType === "user" && receiverUser) {
      io.to(`user:${receiverUser}`).emit("file:shared", payload);
    }

    return res.json({ message: "File uploaded successfully", newFile });
  } catch (error) {
    console.error("UPLOAD FILE ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Files visible to the logged-in user
export const getMyFiles = async (req: any, res: Response) => {
  try {
    const user = req.user;

    const files = await File.find({
      $or: [
        { receiverType: "everyone" },
        { receiverType: "department", receiverDepartment: user.department },
        { receiverType: "user", receiverUser: user._id },
      ],
    })
      .populate("sender", "name email department")
      .sort({ createdAt: -1 });

    return res.json(files);
  } catch (error) {
    console.error("GET MY FILES ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const downloadFile = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const fileId = req.params.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check access like getMyFiles
    const canAccess =
      file.receiverType === "everyone" ||
      (file.receiverType === "department" &&
        file.receiverDepartment === user.department) ||
      (file.receiverType === "user" &&
        file.receiverUser?.toString() === user._id.toString());

    if (!canAccess) {
      return res.status(403).json({ message: "You are not allowed to access this file" });
    }

    // Log download
    const ipAddress = requestIp.getClientIp(req) || "unknown";
    const userAgent = (req.headers["user-agent"] as string) || "unknown";

    await DownloadLog.create({
      file: file._id,
      user: user._id,
      ipAddress,
      userAgent,
      downloadedAt: new Date(),
    });

    const absolutePath = path.resolve(file.filePath);

    return res.download(absolutePath, file.fileName);
  } catch (error) {
    console.error("DOWNLOAD FILE ERROR:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const getMyDownloadLogs = async (req: any, res: Response) => {
  try {
    const logs = await DownloadLog.find({ user: req.user._id })
      .populate("file", "fileName receiverType receiverDepartment")
      .sort({ downloadedAt: -1 });

    return res.json(logs);
  } catch (error) {
    console.error("GET DOWNLOAD LOGS ERROR:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
