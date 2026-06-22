import axios from "axios";
import express from "express";
import fs from "fs";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // In-memory storage for Vercel

// POST /api/transcribe
router.post("/", upload.single("audio"), async (req, res) => {
    console.log("🎤 Transcribe request received");
    if (!req.file) {
        console.error("❌ No file received in request");
        return res.status(400).json({ message: "No audio file provided" });
    }

    // On Vercel serverless, local file uploads to disk are forbidden (EROFS).
    // We process the audio entirely in memory.
    // Note: Local audio playback URL cannot be supported without configuring AWS S3 or Cloudinary.
    const audioUrl = null; 

    try {
        const apiKey = process.env.ASSEMBLYAI_API_KEY;
        if (!apiKey) throw new Error("AssemblyAI API Key missing");

        // 1. Upload memory buffer directly to AssemblyAI
        console.log("🚀 Uploading to AssemblyAI...");
        const uploadRes = await axios.post("https://api.assemblyai.com/v2/upload", req.file.buffer, {
            headers: {
                authorization: apiKey,
                "content-type": "application/octet-stream",
            },
        });
        const uploadUrl = uploadRes.data.upload_url;

        // 2. Request transcription
        const transcriptRes = await axios.post("https://api.assemblyai.com/v2/transcript", {
            audio_url: uploadUrl,
        }, {
            headers: { authorization: apiKey },
        });
        const transcriptId = transcriptRes.data.id;

        // 3. Poll for completion
        let status = "queued";
        let text = "";
        while (status !== "completed" && status !== "error") {
            await new Promise(r => setTimeout(r, 300));
            const pollRes = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: { authorization: apiKey },
            });
            status = pollRes.data.status;
            if (status === "completed") {
                text = pollRes.data.text;
            } else if (status === "error") {
                throw new Error("Transcription failed: " + pollRes.data.error);
            }
        }
        console.log("✅ Transcription complete:", text);

        res.json({ text, audioUrl });

    } catch (err) {
        console.error("❌ Transcription error:", err.response?.data || err.message);
        res.status(500).json({ message: "Transcription failed", error: err.message });
    }
});

export default router;
