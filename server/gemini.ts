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
      model: "gemini-flash-latest",
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
      [STRICT CLINICAL PROTOCOL: DERMATOLOGICAL ONCOLOGY SCREENING]
      You are a Senior Consultant Dermatologist. Analyze the provided image of a skin lesion with forensic precision to determine the risk of MELANOMA.
      
      CRITICAL PRIORITIES:
      1. SENSITIVITY: It is better to flag a benign mole as "Melanoma" (High Risk) for further clinical review than to miss an actual malignancy.
      2. ACCURACY: Base your analysis on the clinical ABCDE criteria.

      EVALUATION CHECKLIST:
      - (A) ASYMMETRY: Is the lesion's shape or internal pattern irregular?
      - (B) BORDER: Is the border ragged, notched, blurred, or fading into the skin?
      - (C) COLOR: Is the pigmentation non-uniform? Are there shades of black, brown, red, blue, or white?
      - (D) DIAMETER: Does the lesion appear to be larger than 6mm?
      - (E) EVOLUTION/ELEVATION: Does the lesion look raised or suggest growth?

      DIAGNOSTIC GUIDELINES:
      - Classify as "Melanoma" if ANY ABCDE criteria are present or if the lesion looks suspicious/irregular.
      - Classify as "Not Melanoma" ONLY if the lesion is perfectly symmetric, uniform in color (tan/brown), and has smooth, regular borders.
      - Classify as "Healthy Skin" ONLY if there is no lesion or mole visible at all.

      Response format (Strict JSON):
      {
        "result": "Melanoma" | "Not Melanoma" | "Healthy Skin",
        "confidence": integer (1-100),
        "hasLesion": boolean,
        "detections": [
          {
            "box": [ymin, xmin, ymax, xmax],
            "confidence": number (0-1),
            "label": "Suspicious Lesion"
          }
        ],
        "analysis": "Step-by-step clinical breakdown of A, B, C, D findings. Final conclusion based on oncology standards."
      }
    `;

    const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";
    const imagePart = fileToGenerativePart(imagePath, mimeType);

    console.log(`[gemini] Initiating analysis with gemini-flash-latest...`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log(`[gemini] Analysis output received.`);
    
    // Extract JSON from output
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from diagnostic engine.");
    }

    const data = JSON.parse(jsonMatch[0]);
    
    // Normalize Result Labels
    const resultStr = (data.result || "").toLowerCase();
    if (resultStr.includes("melanoma") || resultStr.includes("malignant") || resultStr.includes("cancer")) {
      data.result = "Melanoma";
    } else if (resultStr.includes("not") || resultStr.includes("benign")) {
      data.result = "Not Melanoma";
    } else {
      data.result = "Healthy Skin";
    }

    console.log(`[gemini] Diagnosis: ${data.result} (${data.confidence}%)`);

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
    // Enhanced Error Reporting for Quota/Rate Limits
    if (error.status === 429 || error.message?.includes("quota")) {
      console.error(`[gemini] Quota Exceeded (429): ${error.message}`);
      if (retries > 0) {
        const delay = 10000; // 10s backoff
        console.log(`[gemini] Rate limited. Retrying in ${delay/1000}s... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return analyzeSkinImage(imagePath, retries - 1);
      }
      throw new Error("The AI analysis service is temporarily busy (Quota reached). Please try again in 1 minute.");
    }
    
    console.error(`[gemini] Diagnostic failure: ${error.message}`);
    throw error;
  }
}
