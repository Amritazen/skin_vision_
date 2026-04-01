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
  // The global check for apiKey handles this now.
  // if (!process.env.GEMINI_API_KEY) {
  //   throw new Error("GEMINI_API_KEY is not set in environment variables");
  // }

  try {
    // Switching to gemini-flash-latest as per available model list
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, 
        responseMimeType: "application/json",
      },
    });

    const prompt = `
      Analyze this skin lesion image.
      Focus on ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolution).
      
      Response format (Strict JSON):
      {
        "result": "Melanoma" | "Not Melanoma" | "Healthy Skin",
        "confidence": integer (1-100),
        "hasLesion": boolean,
        "analysis": "Brief clinical findings for A, B, C, D, E."
      }
    `;

    const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";
    const imagePart = fileToGenerativePart(imagePath, mimeType);

    console.log(`[gemini] Analyzing image...`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const data = JSON.parse(text);
    
    // Normalize Result Labels
    const resultStr = (data.result || "").toLowerCase();
    if (resultStr.includes("melanoma") || resultStr.includes("malignant")) {
      data.result = "Melanoma";
    } else if (resultStr.includes("not") || resultStr.includes("benign")) {
      data.result = "Not Melanoma";
    } else {
      data.result = "Healthy Skin";
    }

    return data;
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("quota")) {
      if (retries > 0) {
        const delay = 2000; // Reduced to 2s
        await new Promise(resolve => setTimeout(resolve, delay));
        return analyzeSkinImage(imagePath, retries - 1);
      }
      throw new Error("Service busy. Please try again in a moment.");
    }
    throw error;
  }
}
