import mongoose from "mongoose";

const DownloadLogSchema = new mongoose.Schema(
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("DownloadLog", DownloadLogSchema);

