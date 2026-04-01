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
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
  const apiKey = process.env.GEMINI_API_KEY || "";
  let lastError: any = null;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  for (const modelName of modelsToTry) {
    try {
      console.log(`[gemini] REST Attempt: ${modelName} (v1 stable)`);
      
      const payload = {
        contents: [
          {
            parts: [
              { text: "Perform a dermatological assessment of this skin lesion. You MUST return exactly this JSON format: { \"result\": \"Melanoma\" | \"Not Melanoma\" | \"Healthy Skin\", \"confidence\": number (1-100), \"hasLesion\": boolean, \"detections\": [{ \"box\": [ymin, xmin, ymax, xmax], \"label\": \"Suspicious\" }], \"analysis\": \"Clinical breakdown of A, B, C, D findings.\" }" },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const resData: any = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from AI engine.");
      }

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

      console.log(`[gemini] Success with model: ${modelName} (REST v1 stable)`);
      return data;

    } catch (error: any) {
      lastError = error;
      console.warn(`[gemini] Model ${modelName} failed: ${error.message}`);
      
      // Handle Quota with Retries
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        if (retries > 0) {
          const delay = 3000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return analyzeSkinImage(imagePath, retries - 1);
        }
      }
      
      // If it's a 404, we continue the loop for the next model
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        continue;
      }
      
      // For other errors, we continue the loop too, as Pro might have fewer restrictions than Flash
      continue;
    }
  }

  console.error(`[gemini] All models failed. Last error: ${lastError?.message}`);
  throw lastError || new Error("Failed to initialize AI model.");
}
