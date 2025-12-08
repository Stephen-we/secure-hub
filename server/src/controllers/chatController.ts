import { Request, Response } from "express";
import Message from "../models/Message";

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { receiverType, receiverUser, receiverDepartment, message } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      receiverType,
      receiverUser,
      receiverDepartment,
      message,
      attachment: req.file?.path,
      attachmentType: req.file ? req.file.mimetype : null,
    });

    const io = req.app.get("io");

    const payload = {
      id: newMessage._id,
      message: newMessage.message,
      attachment: newMessage.attachment,
      attachmentType: newMessage.attachmentType,
      sender: {
        id: req.user._id,
        name: req.user.name,
        department: req.user.department,
      },
      receiverType,
      receiverUser,
      receiverDepartment,
      createdAt: newMessage.createdAt,
    };

    if (receiverType === "everyone") {
      io.to("everyone").emit("chat:receive", payload);
    } else if (receiverType === "department") {
      io.to(`department:${receiverDepartment}`).emit("chat:receive", payload);
    } else if (receiverType === "user") {
      io.to(`user:${receiverUser}`).emit("chat:receive", payload);
    }

    return res.json({ message: "Message sent", newMessage });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getChatHistory = async (req: any, res: Response) => {
  try {
    const target = req.params.id;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiverUser: target },
        { sender: target, receiverUser: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    return res.json(messages);
  } catch (error) {
    console.error("CHAT HISTORY ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
