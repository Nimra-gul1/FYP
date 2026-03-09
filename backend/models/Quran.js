import mongoose from "mongoose";

const quranSchema = new mongoose.Schema({
    Emotion: { type: String, index: true },
    Surah: { type: String, index: true },
    "Para no": Number,
    "Ayat no": Number,
    Ayat: String,
    Translation: String,
    Tafseer: String
}, { collection: "Quran Dataset", strict: false });

const Quran = mongoose.model("Quran", quranSchema);
export default Quran;
