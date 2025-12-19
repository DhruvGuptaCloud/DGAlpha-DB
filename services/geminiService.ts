
import { GoogleGenAI } from "@google/genai";

/**
 * Generates an analysis using the Gemini 3 Flash model.
 * Instantiates the API client inside the function to ensure the most current API key is used.
 */
export const generateAnalysis = async (prompt: string): Promise<string> => {
  try {
    // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using 'gemini-3-flash-preview' which is recommended for basic text tasks like summaries and report generation.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Use the .text property to extract the generated response.
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to DG Alpha AI service. Please check your connection.";
  }
};