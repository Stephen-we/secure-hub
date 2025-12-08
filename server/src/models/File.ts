import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    name: String,
    storedName: String,
    size: Number,
    type: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);
