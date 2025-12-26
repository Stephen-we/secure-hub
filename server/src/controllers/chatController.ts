import { Request, Response } from "express";
import { Types } from "mongoose";
import Message from "../models/Message";

/**
 * SEND MESSAGE
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, room, message } = req.body;
    const senderId = (req as any).user?.id;

    if (!senderId || !message) {
      return res.status(400).json({ message: "Missing sender or message" });
    }

    const newMessage = await Message.create({
      sender: new Types.ObjectId(senderId),
      receiver: receiverId ? new Types.ObjectId(receiverId) : undefined,
      room,
      message,
    });

    return res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

/**
 * GET CHAT HISTORY
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: id },
        { receiver: id },
        { room: id }
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json(messages);
  } catch (err) {
    console.error("Chat history error:", err);
    res.status(500).json({ message: "Failed to load chat history" });
  }
};
