const DEFAULT_MODEL = 'mistral-large-latest';

function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map(part => (typeof part === 'string' ? part : part?.text || ''))
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

exports.chat = async (messages, options = {}) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    const err = new Error('Mistral API key is not configured');
    err.status = 503;
    throw err;
  }

  const response = await fetch(process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL || DEFAULT_MODEL,
      messages,
      temperature: options.temperature ?? 0.35,
      max_tokens: options.maxTokens ?? 900,
      response_format: options.responseFormat,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(payload?.message || payload?.error?.message || 'Mistral request failed');
    err.status = response.status;
    throw err;
  }

  return extractText(payload?.choices?.[0]?.message?.content).trim();
};

exports.extractJson = (text) => {
  const clean = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(clean);
  } catch (firstError) {
    const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw firstError;
    return JSON.parse(match[0]);
  }
};
