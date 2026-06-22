import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Journal from './models/Journal.js';

dotenv.config();

async function testStreakMath() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Logic from journalRoutes.js
  const entries = await Journal.find().sort({ createdAt: -1 });
  const entryDatesSet = new Set(entries.map(e => e.date));
  
  const clientDate = "Tue Apr 21 2026"; // User's local today
  const today = new Date(clientDate);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - i); // Error here in my logic!

  console.log(`Reference Today: ${today.toDateString()}`);
  console.log(`Reference Yesterday: ${yesterday.toDateString()}`);
  console.log(`Active Dates:`, Array.from(entryDatesSet));
  
  process.exit(0);
}

testStreakMath();
