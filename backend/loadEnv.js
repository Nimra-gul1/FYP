import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dns from 'dns';

// Fix for Windows DNS resolution issues with MongoDB Atlas (ECONNREFUSED querySrv)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
  console.error('Failed to set DNS servers:', error);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Local Environment Variables Loaded");
} else {
  console.log("☁️ Running in Production/Cloud Environment");
}
