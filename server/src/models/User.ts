import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  department: string;
  role: "admin" | "employee"; // admin can manage all departments
  allowedSystems: {
    ip: string;
    mac: string;
  }[];
  loginHistory: {
    ip: string;
    mac: string;
    userAgent: string;
    time: Date;
  }[];
  otp?: string;
  otpExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    department: {
      type: String,
      required: true,
      enum: ["admin", "hr", "sales", "purchase", "godown"],
    },

    role: {
      type: String,
      default: "employee",
      enum: ["admin", "employee"],
    },

    allowedSystems: [
      {
        ip: { type: String },
        mac: { type: String },
      },
    ],

    loginHistory: [
      {
        ip: String,
        mac: String,
        userAgent: String,
        time: { type: Date, default: Date.now },
      },
    ],

    otp: { type: String },

    otpExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
