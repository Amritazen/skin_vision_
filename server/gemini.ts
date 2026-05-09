import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeSkinImage(imagePath: string, retries = 3) {
  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError: any = null;

  if (!apiKey) {
    console.error("[server] GEMINI_API_KEY is not set.");
    throw new Error("API Key is missing. Please add it to your Render environment variables.");
  }

  console.log(`[server] Node version: ${process.version}`);
  console.log(`[server] Using API Key starting with: ${apiKey.substring(0, 4)}...`);

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`[gemini] SDK Attempt: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
        },
        safetySettings,
      });
      
      const prompt = `
        Perform a dermatological assessment of this skin lesion.
        You MUST return exactly this JSON format:
        {
          "result": "Melanoma" | "Not Melanoma" | "Healthy Skin",
          "confidence": number (1-100),
          "hasLesion": boolean,
          "detections": [{ "box": [ymin, xmin, ymax, xmax], "label": "Suspicious" }],
          "analysis": "Clinical breakdown of A, B, C, D findings."
        }
      `;

      const extension = path.extname(imagePath).toLowerCase();
      const mimeType = extension === ".png" ? "image/png" : (extension === ".webp" ? "image/webp" : "image/jpeg");

      console.log(`[gemini] Processing image: ${path.basename(imagePath)} (detected as ${mimeType})`);

      const imagePart = {
        inlineData: {
          data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.warn(`[gemini] Direct JSON parse failed, trying regex match. Text: ${text.substring(0, 100)}...`);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid JSON response format from Gemini.");
        data = JSON.parse(jsonMatch[0]);
      }
      
      // Normalize Result Labels
      const resultStr = (data.result || "").toLowerCase();
      if (resultStr.includes("melanoma") || resultStr.includes("malignant")) {
        data.result = "Melanoma";
      } else if (resultStr.includes("not") || resultStr.includes("benign")) {
        data.result = "Not Melanoma";
      } else {
        data.result = "Healthy Skin";
      }

      if (!data.detections) data.detections = [];
      if (data.detections && data.detections.length > 0) {
        data.detections = data.detections.map((det: any) => {
          const [ymin, xmin, ymax, xmax] = det.box || [0, 0, 0, 0];
          return { ...det, box: [xmin, ymin, xmax, ymax] };
        });
      }

      console.log(`[gemini] Success with model: ${modelName}`);
      return data;
    } catch (error: any) {
      lastError = error;
      console.warn(`[gemini] Model ${modelName} failed: ${error.message}`);
      
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        if (retries > 0) {
          console.log(`[gemini] Retrying after delay due to quota limits...`);
          const delay = 3000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return analyzeSkinImage(imagePath, retries - 1);
        }
      }
      
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        continue;
      }
      // If there's another error, we'll try the next model just in case it's a transient model issue
      continue;
    }
  }

  console.error("[gemini] All models failed. Last error:", lastError);
  
  if (!lastError) {
    throw new Error("AI analysis initialization failed. Please check if GEMINI_API_KEY is correctly set in your environment variables.");
  }
  
  if (lastError.message?.includes("API key not valid")) {
    throw new Error("Invalid Gemini API Key. Please verify your credentials at Google AI Studio.");
  }

  throw lastError;
}
