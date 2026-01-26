
import { GoogleGenAI } from "@google/genai";
import { AUTHOR, BOOK_TITLE } from "../constants";
import { ChatMessage } from "../types";

/**
 * Provides philosophical guidance based on the book's context and conversation history.
 * Uses gemini-3-pro-preview for advanced reasoning on complex philosophical themes.
 */
export async function getGuidance(
  prompt: string, 
  history: ChatMessage[] = [], 
  systemInstruction?: string
): Promise<string> {
  // Initialize inside function to always use up-to-date environment variables
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const defaultInstruction = `You are an "Emotional Companion" inspired by the book "${BOOK_TITLE}" by ${AUTHOR}. Your goal is to help readers navigate the complexities of life and relationships with depth and honesty.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: { 
        systemInstruction: systemInstruction || defaultInstruction,
        temperature: 0.8, 
        topP: 0.9 
      }
    });
    // Access response.text as a property, not a method
    return response.text || "I'm reflecting on your question.";
  } catch (error) {
    console.error("Gemini Guidance Error:", error);
    return "I'm having trouble connecting right now.";
  }
}

/**
 * Generates a poetic meditation for a specific chapter.
 * Uses gemini-3-flash-preview for efficient, creative text generation.
 */
export async function getChapterInsight(chapterTitle: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a one-sentence, deeply philosophical and poetic meditation about the theme: "${chapterTitle}".`,
      config: { temperature: 1.0 }
    });
    // Access response.text as a property
    return response.text || "Love is the bridge between two souls.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Reflection is the mirror of the soul.";
  }
}
