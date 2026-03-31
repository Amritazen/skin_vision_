import "dotenv/config";
import { analyzeSkinImage } from "./gemini";
import path from "path";
import fs from "fs";

async function verifyGeminiPro() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const files = fs.readdirSync(uploadsDir);
  
  if (files.length === 0) {
    console.error("No images found in uploads directory to test.");
    return;
  }

  // Use the most recent upload if possible
  const testImage = path.join(uploadsDir, files[files.length - 1]);
  console.log(`Testing Gemini 1.5 Pro with: ${testImage}`);

  try {
    const result = await analyzeSkinImage(testImage);
    console.log("--- ANALYSIS RESULT ---");
    console.log(JSON.stringify(result, null, 2));
    console.log("------------------------");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

verifyGeminiPro();
