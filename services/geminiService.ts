
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnalysis = async (prompt: string): Promise<string> => {
  try {
    // Using gemini-3-flash-preview for basic text analysis tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to DG Alpha AI service. Please check your connection.";
  }
};
