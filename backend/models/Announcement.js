import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  body:           { type: String, required: true },
  type:           { type: String, enum: ["islamic_reminder", "system_notice", "important_alert", "encouragement"], default: "system_notice" },
  targetAudience: { type: String, enum: ["all", "active", "critical", "new"], default: "all" },
  sentBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipientCount: { type: Number, default: 0 },
  createdAt:      { type: Date, default: Date.now },
});

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
