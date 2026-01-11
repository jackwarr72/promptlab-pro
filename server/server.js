import { createServer } from 'http';
import { GoogleGenAI } from '@google/genai';

const PORT = process.env.API_PORT || 3002;

createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/generate') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { topic, style } = JSON.parse(body || '{}');
        if (!topic) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing topic' }));
          return;
        }

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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text: response.text || '' }));
      } catch (error) {
        console.error('Local API generation error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error?.message || 'Generation failed' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => console.log(`Local API server running on http://localhost:${PORT}`));
