/**
 * Cloudflare Worker: /api/generate
 * - Expects POST { topic, style }
 * - Uses GENAI_API_KEY secret to call Google Generative Language API
 * - CORS enabled for all origins (adjust if needed)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const { topic, style } = body || {};
    if (!topic || typeof topic !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing topic' }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const apiKey = env.GENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured: GENAI_API_KEY missing' }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const model = 'gemini-3-flash-preview';

    // Build prompt (same intent as client)
    const systemInstruction = `Target Framework: Use a structured approach like CO-STAR (Context, Objective, Style, Tone, Audience, Response).\n\nStyle requested: ${style || 'Structured (CO-STAR)'}\n\nThe output should ONLY be the prompt itself, ready to be copied and pasted.`;
    const promptText = `Generate a high-quality AI prompt for the topic: "${topic}"\n\nSystem: ${systemInstruction}`;

    const genUrl = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText?key=${apiKey}`;

    try {
      const gResp = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: { text: promptText }, temperature: 0.8, maxOutputTokens: 512 })
      });

      if (!gResp.ok) {
        const t = await gResp.text();
        return new Response(JSON.stringify({ error: `Upstream error (${gResp.status}): ${t}` }), { status: gResp.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
      }

      const json = await gResp.json();
      // Try a few shapes to extract text
      let text = undefined;
      // Common shape: { candidates: [ { content: [ { text: '...' } ] } ] }
      if (json?.candidates && Array.isArray(json.candidates) && json.candidates[0]) {
        const cand = json.candidates[0];
        if (cand.content && Array.isArray(cand.content) && cand.content[0] && cand.content[0].text) text = cand.content[0].text;
        if (!text && cand.text) text = cand.text;
      }
      // Another possible shape
      if (!text && json?.output && Array.isArray(json.output) && json.output[0]?.content) {
        const c = json.output[0].content;
        if (typeof c === 'string') text = c;
        if (Array.isArray(c) && c[0]?.text) text = c[0].text;
      }
      if (!text && json?.text) text = json.text;

      if (!text) text = JSON.stringify(json);

      return new Response(JSON.stringify({ text }), { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }
  }
};
