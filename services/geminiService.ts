
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Use process.env.API_KEY directly as per SDK requirements. 
// This key is pre-configured and does not require the user to provide their own "premium" key.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts a descriptive prompt from an image for recreation purposes.
 */
export const extractPromptFromImage = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const textPart = {
    text: `Analyze this image for style, environment, and pose ONLY. 
    Describe:
    1. The exact pose and gestures of the subject.
    2. The lighting, color palette (especially soft pink and white floral hues), and cinematic atmosphere.
    3. The background and surroundings.
    
    IMPORTANT: Do not describe the person's identity. Focus on the 'scene' itself.
    Write as a single paragraph with rich detail.`
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
  });

  return response.text || "Could not extract prompt.";
};

/**
 * Generates a new image using gemini-2.5-flash-image (standard key supported).
 */
export const generateNewImage = async (
  prompt: string, 
  userImageBase64?: string, 
  refinement?: string
): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-2.5-flash-image';

  const parts: any[] = [];

  if (userImageBase64) {
    const userImagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: userImageBase64.split(',')[1] || userImageBase64,
      },
    };
    
    // Detailed instructions to ensure gemini-2.5-flash-image follows identity constraints.
    const instructionText = `
      PHOTO RECREATION TASK:
      1. SUBJECT IDENTITY: Use the EXACT facial features and age from the provided face photo. 
      - If the subject is a child, keep them a child.
      - Maintain hair color, eye shape, and facial proportions exactly.
      
      2. ENVIRONMENT & STYLE: Place this person into the following scene: ${prompt}.
      
      3. COLOR THEME: Focus on Ghera Pink and White floral aesthetics as the dominant palette.
      
      4. USER REQUESTS: ${refinement || 'Ensure a high-quality, cinematic portrait finish.'}
      
      Output MUST be a single high-quality image.
    `;
    
    parts.push(userImagePart, { text: instructionText });
  } else {
    parts.push({ text: `High-quality cinematic portrait with Ghera Pink theme: ${prompt}. ${refinement}` });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Generation failed.");
};
