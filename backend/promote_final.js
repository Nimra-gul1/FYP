import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'finaladmin@qalbify.com' });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Promoted ${user.email} to admin.`);
    } else {
      console.log("User not found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
