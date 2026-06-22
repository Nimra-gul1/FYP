import "./loadEnv.js";
import { OAuth2Client } from "google-auth-library";

async function verifyConfig() {
  console.log("--- Google Auth Configuration Test ---");
  
  const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const ANDROID_ID = process.env.ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
  const IOS_ID = process.env.IOS_CLIENT_ID || process.env.EXPO_PUBLIC_IOS_CLIENT_ID;

  console.log("GOOGLE_CLIENT_ID:", GOOGLE_ID ? "✅ Loaded" : "❌ Missing");
  console.log("ANDROID_CLIENT_ID:", ANDROID_ID ? "✅ Loaded" : "❌ Missing");
  console.log("IOS_CLIENT_ID:", IOS_ID ? "✅ Loaded" : "❌ Missing");

  if (!GOOGLE_ID) {
    console.error("CRITICAL: No Web Client ID found. Verification will fail.");
    return;
  }

  const client = new OAuth2Client(GOOGLE_ID);
  const audience = [GOOGLE_ID, ANDROID_ID, IOS_ID].filter(Boolean);
  
  console.log("Active Audience List:", audience);

  console.log("\nAttempting to verify a dummy token (should fail with 'Wrong number of segments' or 'Invalid token', NOT 'Missing audience')...");
  
  try {
    await client.verifyIdToken({
      idToken: "dummy-token-for-testing",
      audience: audience,
    });
  } catch (err) {
    if (err.message.includes("Wrong number of segments") || err.message.includes("Can't parse token")) {
      console.log("✅ Logic Test Passed: The verification logic reached the token parsing stage.");
    } else {
      console.log("❌ Logic Test Failed:", err.message);
    }
  }
}

verifyConfig();
