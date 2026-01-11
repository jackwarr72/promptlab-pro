import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from "@google/genai";
import { PromptStyle } from "../types";

// This file is written to be compatible with serverless platforms like Vercel/Netlify.
// It expects an environment variable `GENAI_API_KEY` to be set in the deployment environment.

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { topic, style } = req.body || {};
  if (!topic) {
    res.status(400).json({ error: 'Missing topic' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || process.env.API_KEY || '' });

    const systemInstruction = `
      You are an elite Prompt Engineer. Your mission is to take a simple user topic and transform it into a world-class AI prompt.

      Target Framework: Use a structured approach like CO-STAR (Context, Objective, Style, Tone, Audience, Response).

      Style requested: ${style}

      The output should ONLY be the prompt itself, ready to be copied and pasted into ChatGPT or another LLM. Do not include introductory text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-quality AI prompt for the topic: "${topic}"`,
      config: {
        systemInstruction,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    res.status(200).json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Server-side generation error:', error);
    res.status(500).json({ error: error?.message || 'Generation failed' });
  }
}
