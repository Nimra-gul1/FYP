import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection to:', MONGO_URI.split('@')[1]);

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Success: Connected to MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error: Failed to connect to MongoDB');
    console.error(err.message);
    process.exit(1);
  }
}

test();
