import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiverType: "user" | "department" | "everyone";
  receiverUser?: string;
  receiverDepartment?: string;
  message: string;
  attachment?: string;
  attachmentType?: string; // image | file | folder
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },

    receiverType: {
      type: String,
      enum: ["user", "department", "everyone"],
      required: true,
    },

    receiverUser: { type: Schema.Types.ObjectId, ref: "User" },

    receiverDepartment: { type: String },

    message: { type: String, default: "" },

    attachment: { type: String }, // file path

    attachmentType: { type: String }, // image/file/folder
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
