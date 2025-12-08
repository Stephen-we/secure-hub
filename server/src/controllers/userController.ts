import { Request, Response } from "express";
import User from "../models/User";

export const getAllUsers = async (req: any, res: Response) => {
  try {
    // later we can add filters (same branch, etc.)
    const users = await User.find({}, "name email department role").sort({
      department: 1,
      name: 1,
    });

    return res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
