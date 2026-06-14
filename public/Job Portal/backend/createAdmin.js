import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

const existing = await User.findOne({ email: "admin@sholok.com" });
if (existing) {
  console.log("Admin already exists:", existing.email, existing.role);
} else {
  const admin = await User.create({
    name: "Admin",
    email: "admin@sholok.com",
    password: "admin123",
    role: "admin",
  });
  console.log("Admin created:", admin.email, admin.role);
}

await mongoose.disconnect();
process.exit(0);
