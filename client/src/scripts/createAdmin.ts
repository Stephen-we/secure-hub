import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";

const MONGO_URI = process.env.MONGO_URI!;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongo connected");

    const email = "admin@securehub.com";
    const password = "admin123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "Super Admin",
      email,
      password: hashed,
      role: "admin",
      department: "management",
      devices: [],
    });

    console.log("Admin created:", admin);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
