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
    // Switching to gemini-1.5-flash for speed but with full prompt
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1, 
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
      safetySettings: [
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
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
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

    console.log(`[gemini] Starting analysis for: ${imagePath}`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Robustly extract JSON from output
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response from AI diagnostic engine.");
    }

    const data = JSON.parse(jsonMatch[0]);
    
    // Normalize Result Labels
    const resultStr = (data.result || "").toLowerCase();
    if (resultStr.includes("melanoma") || resultStr.includes("malignant")) {
      data.result = "Melanoma";
    } else if (resultStr.includes("not") || resultStr.includes("benign")) {
      data.result = "Not Melanoma";
    } else {
      data.result = "Healthy Skin";
    }

    // Default detections if missing
    if (!data.detections) data.detections = [];

    // Coordinate conversion for UI
    if (data.detections && data.detections.length > 0) {
      data.detections = data.detections.map((det: any) => {
        const [ymin, xmin, ymax, xmax] = det.box;
        return {
          ...det,
          box: [xmin, ymin, xmax, ymax]
        };
      });
    }

    return data;
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("quota")) {
      if (retries > 0) {
        const delay = 3000; // 3s backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return analyzeSkinImage(imagePath, retries - 1);
      }
      throw new Error("Service is temporarily busy. Please wait a moment.");
    }
    
    console.error(`[gemini] Diagnostic failure: ${error.message}`);
    throw error;
  }
}
