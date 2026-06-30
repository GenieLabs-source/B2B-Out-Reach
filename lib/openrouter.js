const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const FETCH_TIMEOUT_MS = 30000

export const MODELS = {
  research: 'google/gemini-2.5-flash-lite',
  observer: 'openai/gpt-4o-mini',
  email: 'anthropic/claude-haiku-4.5'
}

// Per-million-token pricing, used to compute accurate cost_usd per call.
// FIX: previously this was hardcoded to Claude Sonnet pricing regardless of which
// model actually ran, wildly overstating cost for the cheaper Gemini/GPT-4o-mini calls.
const PRICING = {
  'google/gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.60 },
  'anthropic/claude-haiku-4.5': { input: 1.00, output: 5.00 }
}
const DEFAULT_PRICING = { input: 1.00, output: 5.00 } // conservative fallback if model isn't in the table

export async function callOpenRouter(systemPrompt, userPrompt, model, maxTokens = 4000) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Server misconfiguration: OPENROUTER_API_KEY is not set')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let res
  try {
    res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://leadsgenie.ai',
        'X-Title': 'Leads Genie'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`OpenRouter request timed out after ${FETCH_TIMEOUT_MS / 1000}s`)
    }
    throw new Error(`OpenRouter network error: ${err.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''

  const inputTokens = data.usage?.prompt_tokens || 0
  const outputTokens = data.usage?.completion_tokens || 0
  const pricing = PRICING[model] || DEFAULT_PRICING

  const usage = {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model: data.model || model,
    cost_usd: (
      (inputTokens / 1_000_000) * pricing.input +
      (outputTokens / 1_000_000) * pricing.output
    ).toFixed(6)
  }

  return { text, usage }
}

export function extractJSON(text, type = 'array') {
  if (!text || typeof text !== 'string') throw new Error('Empty or invalid response from model')

  try { return JSON.parse(text.trim()) } catch (e) {}
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  try { return JSON.parse(clean) } catch (e) {}

  if (type === 'array') {
    const start = clean.indexOf('[')
    const end = clean.lastIndexOf(']')
    if (start !== -1 && end > start) {
      try { return JSON.parse(clean.slice(start, end + 1)) } catch (e) {}
    }
  }

  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end > start) {
    const obj = JSON.parse(clean.slice(start, end + 1))
    return type === 'array' ? [obj] : obj
  }

  throw new Error('No valid JSON found in model response')
}
