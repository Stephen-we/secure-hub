const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  department: { type: String, default: 'management' },
  isVerified: { type: Boolean, default: false },
  devices: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB using the same URI as your server
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27018/securehub?authSource=admin');
    console.log("MongoDB connected");

    const email = "admin@securehub.com";
    const password = "admin123";

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", existing.email);
      console.log("You can login with:");
      console.log("Email: admin@securehub.com");
      console.log("Password: admin123");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      name: "Super Admin",
      email,
      password: hashed,
      role: "admin",
      department: "management",
      devices: [],
      isVerified: true
    });

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@securehub.com");
    console.log("Password: admin123");
    console.log("Role: admin");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
