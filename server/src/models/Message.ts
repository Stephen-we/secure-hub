import mongoose, { Schema, Types, Document } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver?: Types.ObjectId;
  room?: string;
  message: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    room: {
      type: String,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
