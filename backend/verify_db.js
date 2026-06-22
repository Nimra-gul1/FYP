import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Chat from './models/Chat.js';

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u.email} (Role: ${u.role})`));

    // Promote the first user to admin if none found
    if (users.length > 0 && !users.some(u => u.role === 'admin')) {
      users[0].role = 'admin';
      await users[0].save();
      console.log(`Promoted ${users[0].email} to admin.`);
    }

    const chats = await Chat.find().limit(5).sort({ createdAt: -1 });
    console.log(`Latest ${chats.length} chats:`);
    chats.forEach(c => console.log(`- ${c.isUser ? 'User' : 'Bot'}: ${c.text}`));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
