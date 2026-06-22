import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Emotion from "./models/Emotion.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fypdb");
  console.log("Connected. Seeding 100 private users for K-Anonymity test...");

  const cities = [
    { name: "Lahore", count: 42, emotion: "anxious", score: 0.8 },
    { name: "Karachi", count: 35, emotion: "sad", score: 0.7 },
    { name: "Islamabad", count: 18, emotion: "fearful", score: 0.9 },
    { name: "Peshawar", count: 3, emotion: "happy", score: 0.8 },   // Will be K-Anonymized
    { name: "Quetta", count: 2, emotion: "sad", score: 0.6 }        // Will be K-Anonymized
  ];

  for (const c of cities) {
    for (let i = 0; i < c.count; i++) {
      const u = await User.create({
        name: `User_${c.name}_${Math.floor(Math.random()*9999)}`,
        email: `u${Math.floor(Math.random()*99999)}@test.com`,
        password: "hashed_dummy",
        city: c.name,
        role: "user"
      });
      // Give them an emotion
      await Emotion.create({
        userId: u._id,
        emotion: c.emotion,
        score: c.score,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
  }

  console.log("Seed complete! 100 users added to test K=15 thresholds. Peshawar and Quetta should merge into Other Regions.");
  process.exit(0);
}

seed().catch(console.dir);
