import mongoose, { Schema, Document } from "mongoose";

export type OtpPurpose = "DEVICE_APPROVAL";

export interface IOtpToken extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  otpCode: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  used: boolean;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: String, required: true },
    otpCode: { type: String, required: true },
    purpose: { type: String, enum: ["DEVICE_APPROVAL"], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto delete OTP after expiry
OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtpToken>("OtpToken", OtpTokenSchema);
