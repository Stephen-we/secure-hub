import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Device from "../models/Device";
import OtpToken from "../models/OtpToken";
import { generateOtp } from "../utils/otp";
import { sendEmail } from "../utils/sendEmail";
import requestIp from "request-ip";

const router = Router();

/**
 * ============================================
 *              REGISTER USER
 * ============================================
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, role } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      role: role || "employee",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

/**
 * ============================================
 *               LOGIN USER
 * ============================================
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, deviceId, hostName } = req.body;

    if (!email || !password || !deviceId) {
      return res.status(400).json({
        message: "email, password, and deviceId are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // SYSTEM info
    const ipAddress = requestIp.getClientIp(req) || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    /**
     * ==============================================================
     * 🚀 ADMIN LOGIN → BYPASS OTP TOTALLY (EVEN FOR NEW DEVICE)
     * ==============================================================
     */
    if (user.role === "admin") {
      // Create or update device entry as approved
      let device = await Device.findOne({ userId: user._id, deviceId });

      if (!device) {
        device = await Device.create({
          userId: user._id,
          deviceId,
          ipAddress,
          userAgent,
          hostName,
          isApproved: true,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          approvedAt: new Date(),
        });
      } else {
        device.isApproved = true;
        device.approvedAt = new Date();
        device.lastSeenAt = new Date();
        await device.save();
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Admin login successful (No OTP required)",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          role: user.role,
        },
      });
    }

    /**
     * =====================================================
     * NORMAL USER — CHECK APPROVED DEVICE
     * =====================================================
     */

    let device = await Device.findOne({ userId: user._id, deviceId });

    // DEVICE APPROVED → LOGIN SUCCESS
    if (device && device.isApproved) {
      device.ipAddress = ipAddress;
      device.userAgent = userAgent as string;
      device.hostName = hostName || device.hostName;
      device.lastSeenAt = new Date();
      await device.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          role: user.role,
        },
      });
    }

    /**
     * =====================================================
     * NEW DEVICE → SEND OTP
     * =====================================================
     */
    if (!device) {
      device = await Device.create({
        userId: user._id,
        deviceId,
        ipAddress,
        userAgent,
        hostName,
        isApproved: false,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      });
    } else {
      device.ipAddress = ipAddress;
      device.userAgent = userAgent as string;
      device.hostName = hostName || device.hostName;
      device.lastSeenAt = new Date();
      await device.save();
    }

    // Generate OTP
    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpToken.create({
      userId: user._id,
      deviceId,
      otpCode: otp,
      purpose: "DEVICE_APPROVAL",
      expiresAt,
      used: false,
    });

    // Send OTP email
    await sendEmail(
      user.email,
      "Your SecureHub Device OTP",
      `Your OTP is: ${otp}\nValid for 10 minutes.\nDevice ID: ${deviceId}`
    );

    return res.status(403).json({
      status: "DEVICE_OTP_REQUIRED",
      message: "New device detected. OTP sent to your email.",
      deviceId,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

/**
 * ============================================
 *           VERIFY DEVICE OTP
 * ============================================
 */
router.post("/verify-device-otp", async (req: Request, res: Response) => {
  try {
    const { email, deviceId, otpCode } = req.body;

    if (!email || !deviceId || !otpCode) {
      return res.status(400).json({
        message: "email, deviceId, and otpCode are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or OTP" });

    const otpEntry = await OtpToken.findOne({
      userId: user._id,
      deviceId,
      otpCode,
      purpose: "DEVICE_APPROVAL",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpEntry)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    otpEntry.used = true;
    await otpEntry.save();

    const device = await Device.findOne({ userId: user._id, deviceId });
    if (!device)
      return res.status(400).json({ message: "Device not found" });

    device.isApproved = true;
    device.approvedAt = new Date();
    await device.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Device approved and login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("VERIFY OTP ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

export default router;
