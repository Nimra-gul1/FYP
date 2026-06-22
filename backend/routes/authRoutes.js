import bcrypt from "bcryptjs";
import crypto from "crypto";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const AUTH_ROUTES_VERSION = "google-login-token-fix-2026-05-03";

router.get("/version", (req, res) => {
  res.json({ version: AUTH_ROUTES_VERSION });
});

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    // Admin security check
    let role = "user";
    if (adminKey) {
      if (adminKey === process.env.ADMIN_SECRET_KEY) {
        role = "admin";
      } else {
        return res.status(401).json({ message: "Invalid admin secret key" });
      }
    } else if (email === "nimragul981@gmail.com") {
      role = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const io = req.app.get("io");
    if (io) {
      io.emit("activity_feed", {
        type: "auth",
        action: "System Registration",
        email: newUser.email,
        userId: newUser._id,
        ts: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: "Signup successful!",
      token,
      role: newUser.role || "user",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REFRESH TOKEN
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Token missing" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: newToken, role: user.role });
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.lastActive = new Date();
    await user.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("activity_feed", {
        type: "auth",
        action: "User Login",
        email: user.email,
        userId: user._id,
        ts: new Date().toISOString()
      });
    }

    res.json({
      token,
      role: user.role || "user",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    console.log(`[Forgot Password] Request for: ${email}`);

    // Ensure environment variables are present
    if (!process.env.QALBIFY_EMAIL || !process.env.QALBIFY_PASS) {
      console.error("[Forgot Password] Error: QALBIFY_EMAIL or QALBIFY_PASS not set in environment.");
      return res.status(500).json({ message: "Server email configuration is missing." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[Forgot Password] User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Nodemailer setup inside the route for serverless stability
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.QALBIFY_EMAIL,
        pass: process.env.QALBIFY_PASS,
      },
    });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const resetLink = `${protocol}://${host}/api/auth/reset-password/${token}`;

    console.log(`[Forgot Password] Sending email via ${process.env.QALBIFY_EMAIL}`);

    const mailOptions = {
      from: `"Qalbify Team" <${process.env.QALBIFY_EMAIL}>`,
      to: user.email,
      subject: "Reset Your Qalbify Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4A235A; text-align: center;">Reset Your Qalbify Password</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password for your Qalbify account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #9D50BB; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">Best regards,<br>The Qalbify Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Forgot Password] Email sent successfully to: ${user.email}`);
    res.json({ message: "Reset link sent to your email!" });
  } catch (err) {
    console.error("[Forgot Password] Error:", err);
    res.status(500).json({ message: err.message || "Failed to send email." });
  }
});

// GET RESET PASSWORD PAGE (Served directly from backend for simplicity)
router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2 style="color: #e11d48;">Link Expired</h2>
        <p>This password reset link is invalid or has expired.</p>
        <a href="/" style="color: #9D50BB;">Go back</a>
      </div>
    `);
  }

  // Escape the token for use in the client-side script
  const safeToken = String(token);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password | Qalbify</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fdfbff; }
        .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
        h2 { color: #4A235A; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 30px; }
        input { width: 100%; padding: 15px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; font-size: 16px; }
        button { width: 100%; padding: 15px; background: #9D50BB; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; }
        .success { color: #15803d; background: #f0fdf4; padding: 15px; border-radius: 10px; display: none; }
      </style>
    </head>
    <body>
      <div class="card" id="formCard">
        <h2>Reset Password</h2>
        <p>Set a new secure password for your account.</p>
        <input type="password" id="password" placeholder="New Password" required>
        <button id="submitBtn">Update Password</button>
      </div>
      <div class="card" id="successCard" style="display: none;">
        <h2 style="color: #15803d;">Success!</h2>
        <p>Your password has been updated. You can now log in using your new password in the Qalbify app.</p>
      </div>

      <script>
        const submitBtn = document.getElementById('submitBtn');
        const passwordInput = document.getElementById('password');
        const formCard = document.getElementById('formCard');
        const successCard = document.getElementById('successCard');

        submitBtn.onclick = async () => {
          const password = passwordInput.value;
          if (!password) return alert('Please enter a password');
          
          submitBtn.innerText = 'Updating...';
          submitBtn.disabled = true;

          try {
            const res = await fetch('/api/auth/reset-password/${safeToken}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
            });
            if (res.ok) {
              formCard.style.display = 'none';
              successCard.style.display = 'block';
            } else {
              const data = await res.json();
              alert(data.message || 'Reset failed');
              submitBtn.innerText = 'Update Password';
              submitBtn.disabled = false;
            }
          } catch (e) {
            alert('Something went wrong');
            submitBtn.innerText = 'Update Password';
            submitBtn.disabled = false;
          }
        };
      </script>
    </body>
    </html>
  `);
});

// GOOGLE AUTH
router.post("/google-login", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    const ANDROID_ID = process.env.ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
    const IOS_ID = process.env.IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID;

    if (!GOOGLE_ID) {
      console.error("❌ GOOGLE_CLIENT_ID missing");
      return res.status(500).json({ message: "Server configuration error: Google ID missing" });
    }

    const googleClientInstance = new OAuth2Client(GOOGLE_ID);
    const ticket = await googleClientInstance.verifyIdToken({
      idToken,
      audience: [GOOGLE_ID, ANDROID_ID, IOS_ID].filter(Boolean),
    });

    const googlePayload = ticket.getPayload();
    if (!googlePayload || !googlePayload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const userEmail = googlePayload.email;
    const userName = googlePayload.name || userEmail.split("@")[0];

    let foundUser = await User.findOne({ email: userEmail });
    if (!foundUser) {
      const tempPass = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
      foundUser = new User({
        name: userName,
        email: userEmail,
        password: tempPass,
        role: userEmail === "nimragul981@gmail.com" ? "admin" : "user"
      });
      await foundUser.save();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    foundUser.lastActive = new Date();
    await foundUser.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("activity_feed", {
        type: "auth",
        action: "Google Login",
        email: foundUser.email,
        userId: foundUser._id,
        ts: new Date().toISOString()
      });
    }

    res.json({
      token,
      version: AUTH_ROUTES_VERSION,
      user: { id: foundUser._id, name: foundUser.name, email: foundUser.email, role: foundUser.role },
    });
  } catch (error) {
    console.error("❌ GOOGLE LOGIN CRITICAL ERROR:", error);
    res.status(500).json({ message: "Google login backend error: " + error.message });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been successfully reset!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
