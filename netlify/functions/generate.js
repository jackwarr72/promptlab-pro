// Netlify Function: netlify/functions/generate.js
// Handles POST /api/generate (redirected via netlify.toml)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async function (event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { topic, style } = body || {};
  if (!topic || typeof topic !== 'string') {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing topic' })
    };
  }

  const API_KEY = process.env.GENAI_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server not configured: GENAI_API_KEY missing' })
    };
  }

  const model = 'gemini-3-flash-preview';
  const systemInstruction = `Target Framework: Use a structured approach like CO-STAR (Context, Objective, Style, Tone, Audience, Response).\n\nStyle requested: ${style || 'Structured (CO-STAR)'}\n\nThe output should ONLY be the prompt itself, ready to be copied and pasted.`;
  const promptText = `Generate a high-quality AI prompt for the topic: "${topic}"\n\nSystem: ${systemInstruction}`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: { text: promptText }, temperature: 0.8, maxOutputTokens: 512 })
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      return {
        statusCode: resp.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Upstream error (${resp.status}): ${t}` })
      };
    }

    const json = await resp.json();
    // Extract text from a few possible shapes
    let text = undefined;
    if (json?.candidates && Array.isArray(json.candidates) && json.candidates[0]) {
      const cand = json.candidates[0];
      if (cand.content && Array.isArray(cand.content) && cand.content[0] && cand.content[0].text) text = cand.content[0].text;
      if (!text && cand.text) text = cand.text;
    }
    if (!text && json?.output && Array.isArray(json.output) && json.output[0]?.content) {
      const c = json.output[0].content;
      if (typeof c === 'string') text = c;
      if (Array.isArray(c) && c[0]?.text) text = c[0].text;
    }
    if (!text && json?.text) text = json.text;
    if (!text) text = JSON.stringify(json);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err) })
    };
  }
};
