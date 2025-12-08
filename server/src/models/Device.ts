import mongoose, { Schema, Document } from "mongoose";

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  hostName?: string;
  isApproved: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
}

const DeviceSchema = new Schema<IDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    hostName: { type: String },

    isApproved: { type: Boolean, default: false },

    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },

    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Unique: 1 user = cannot have same deviceId twice
DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default mongoose.model<IDevice>("Device", DeviceSchema);
