
import { GoogleGenAI } from "@google/genai";
import { PromptStyle } from "../types";

export const generateAIPrompt = async (topic: string, style: PromptStyle): Promise<string> => {
  // If running server-side (SSR, serverless function code importing this file), call GoogleGenAI directly
  if (typeof window === 'undefined') {
    const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || process.env.API_KEY || '' });

    const systemInstruction = `
      You are an elite Prompt Engineer. Your mission is to take a simple user topic and transform it into a world-class AI prompt.
      
      Target Framework: Use a structured approach like CO-STAR (Context, Objective, Style, Tone, Audience, Response).
      
      Style requested: ${style}
      
      If Structured: Include clear sections like # Role, # Context, # Task, # Constraints, and # Output Format.
      If Creative: Use evocative language and detailed world-building.
      If Concise: Strip away fluff but keep essential directives.
      If Academic: Use formal terminology and request citations/reasoning.
      
      The output should ONLY be the prompt itself, ready to be copied and pasted into ChatGPT or another LLM. Do not include introductory text like "Here is your prompt:".
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a high-quality AI prompt for the topic: "${topic}"`,
        config: {
          systemInstruction,
          temperature: 0.8,
          topP: 0.95,
        },
      });

      return response.text || "Failed to generate prompt. Please try again.";
    } catch (error: any) {
      console.error("Gemini Generation Error (server):", error);
      const msg = error?.message || String(error) || 'Check your connection or API status.';
      throw new Error(`Generation failed. ${msg}`);
    }
  }

  // Client-side: proxy through serverless endpoint to keep API keys secret
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, style }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.text || "Failed to generate prompt. Please try again.";
  } catch (error: any) {
    console.error("Gemini Generation Error (client proxy):", error);
    const msg = error?.message || String(error) || 'Check your connection or API status.';
    throw new Error(`Generation failed (client). ${msg}`);
  }
};
