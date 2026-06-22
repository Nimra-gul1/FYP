import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Audit from "./models/Audit.js";

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fypdb");
    
    const logs = await Audit.find().sort({ timestamp: -1 }).limit(5).lean();
    console.log("Found Audit Logs:", logs.length);
    if (logs.length > 0) {
        console.log("Latest log:", JSON.stringify(logs[0], null, 2));
    }
    
    const totalAudits = await Audit.countDocuments();
    console.log("Total Audits in DB:", totalAudits);

    process.exit(0);
}
check();
