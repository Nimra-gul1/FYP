import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database...");

    const email = "admin@qalbify.com"; // Default admin email
    const password = "admin123"; // Standardized for this project

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Admin user already exists. Updating role and password...");
      existingUser.role = "admin";
      existingUser.password = await bcrypt.hash(password, 10);
      await existingUser.save();
      console.log("Admin credentials synchronized successfully.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log(`Admin created successfully! Email: ${email}, Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
