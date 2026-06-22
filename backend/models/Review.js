import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    userEmail: { type: String, required: true },
    userName: { type: String, default: "Anonymous" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Review", reviewSchema);
