import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Journal from './models/Journal.js';

dotenv.config();

async function debugStreak() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const entries = await Journal.find().sort({ createdAt: -1 }).limit(10);
  console.log('--- RECENT ENTRIES ---');
  entries.forEach(e => {
    console.log(`ID: ${e._id}, Date(Field): ${e.date}, CreatedAt: ${e.createdAt.toISOString()}`);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`Server Today (UTC): ${todayStr}`);
  
  process.exit(0);
}

debugStreak();
