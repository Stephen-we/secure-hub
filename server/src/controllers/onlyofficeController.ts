import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import File from "../models/File";

export const getOnlyOfficeConfig = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const user = (req as any).user;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileUrl = `${process.env.SERVER_PUBLIC_URL}/uploads/${file.filename}`;

    const config = {
      document: {
        fileType: file.extension,
        key: file._id.toString(),
        title: file.originalName,
        url: fileUrl,
      },
      documentType:
        ["doc", "docx", "odt"].includes(file.extension)
          ? "word"
          : ["xls", "xlsx"].includes(file.extension)
          ? "cell"
          : "slide",
      editorConfig: {
        mode: "view",
        user: {
          id: user._id.toString(),
          name: user.email,
        },
      },
    };

    const token = jwt.sign(
      config,
      process.env.ONLYOFFICE_JWT_SECRET as string
    );

    res.json({ config, token });
  } catch (err) {
    console.error("OnlyOffice config error:", err);
    res.status(500).json({ message: "OnlyOffice config failed" });
  }
};
