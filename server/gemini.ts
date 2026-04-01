import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("[gemini] Warning: GEMINI_API_KEY is not set. Image analysis will fail.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Converts local file information to a GoogleGenerativeAI.Part object.
 */
function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

export async function analyzeSkinImage(imagePath: string, retries = 3) {
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[gemini] Attempting analysis with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.1, 
          responseMimeType: "application/json",
        },
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

      const mimeType = "image/jpeg"; 
      const imagePart = {
          inlineData: {
              data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
              mimeType,
          },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response from AI diagnostic engine.");
      }

      const data = JSON.parse(jsonMatch[0]);
      
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
          const [ymin, xmin, ymax, xmax] = det.box;
          return {
            ...det,
            box: [xmin, ymin, xmax, ymax]
          };
        });
      }

      console.log(`[gemini] Success with model: ${modelName}`);
      return data;
    } catch (error: any) {
      lastError = error;
      // If it's a 404, try the next model in the list
      if (error.status === 404 || error.message?.includes("404") || error.message?.includes("not found")) {
        console.warn(`[gemini] Model ${modelName} not found, trying next...`);
        continue;
      }
      
      // If it's a quota error, handle retries
      if (error.status === 429 || error.message?.includes("quota")) {
        if (retries > 0) {
          const delay = 3000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return analyzeSkinImage(imagePath, retries - 1);
        }
        throw new Error("Service busy. Please wait a moment.");
      }
      
      // For other errors, rethrow to be caught by the outer loop if we have more models
      console.error(`[gemini] Error with ${modelName}: ${error.message}`);
    }
  }

  // If we reach here, all models failed
  console.error(`[gemini] All models failed. Last error: ${lastError?.message}`);
  throw lastError || new Error("Failed to initialize AI model.");
}
