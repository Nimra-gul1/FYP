import axios from "axios";
import express from "express";
import fs from "fs";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary file storage

// Helper: Delete file
const deleteFile = (path) => {
    try {
        fs.unlinkSync(path);
    } catch (e) {
        console.error("Failed to delete temp file:", e);
    }
};

// POST /api/transcribe
router.post("/", upload.single("audio"), async (req, res) => {
    console.log("🎤 Transcribe request received");
    if (!req.file) {
        console.error("❌ No file received in request");
        return res.status(400).json({ message: "No audio file provided" });
    }

    // Rename file to have .m4a extension for playback
    const oldPath = req.file.path;
    const newFilename = `${req.file.filename}.m4a`;
    const newPath = `uploads/${newFilename}`;

    try {
        fs.renameSync(oldPath, newPath);
    } catch (e) {
        console.error("❌ Failed to rename/move file:", e);
        return res.status(500).json({ message: "File processing error" });
    }

    const audioPath = newPath;
    console.log(`📁 File saved to: ${audioPath}, size: ${req.file.size} bytes`);

    // Construct public URL (Assuming server is reachable at process.env.EXPO_PUBLIC_API_BASE)
    // We can also just return the relative path if the frontend knows the base.
    // Ideally use a BACKEND_URL env, but usually EXPO_PUBLIC_API_BASE is the one.
    // If not available in backend env, we can use req.protocol + '://' + req.get('host')
    const protocol = req.protocol;
    const host = req.get('host');
    const audioUrl = `${protocol}://${host}/uploads/${newFilename}`;

    try {
        const apiKey = process.env.ASSEMBLYAI_API_KEY;

        if (!apiKey) throw new Error("AssemblyAI API Key missing");

        // 1. Upload file to AssemblyAI
        console.log("🚀 Uploading to AssemblyAI...");
        const audioData = fs.readFileSync(audioPath);
        const uploadRes = await axios.post("https://api.assemblyai.com/v2/upload", audioData, {
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
        // Only delete if error
        try { fs.unlinkSync(audioPath); } catch { }
        console.error("❌ Transcription error:", err.response?.data || err.message);
        res.status(500).json({ message: "Transcription failed", error: err.message });
    }
});

export default router;
