import { getAuthedRequest } from '../../lib/auth-helper'
import { callOpenRouter, extractJSON, MODELS } from '../../lib/openrouter'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await getAuthedRequest(req, res)
  if (!auth) return res.status(401).json({ error: 'Not signed in or session expired' })

  const { prospect } = req.body || {}
  if (!prospect || typeof prospect !== 'object' || !prospect.name || !prospect.company) {
    return res.status(400).json({ error: 'Invalid prospect data', verified: false })
  }

  try {
    const systemPrompt = `You are a strict contact verification agent with access to real-time web search. You MUST use the web_search tool to check this specific person and company — do not rely on memory or guess. Your job is to catch fabricated or incorrect contacts, not to be lenient. If you cannot find independent confirmation that this named person currently holds this role at this company, mark it unverified. Output ONLY raw JSON. No markdown. No backticks.`

    const userPrompt = `Search the web to verify this contact:

Name: ${prospect.name}
Claimed role: ${prospect.role}
Company: ${prospect.company}
Claimed source: ${prospect.source_url || 'none provided'}
${prospect.email ? `Claimed email: ${prospect.email}` : 'No email was found yet — try to find their real work email via search (company press page, About page, or a public source). Do not guess a format.'}

Search for "${prospect.name} ${prospect.company}" and "${prospect.company} ${prospect.role}" to confirm:
1. Does this exact person appear in real search results connected to this company?
2. Are they currently (not formerly) in this role or a closely equivalent one?
3. If no email was provided, did you find one via search? If you only found a likely format with no direct evidence, leave email as null rather than guessing.

Be strict — if search results are weak, ambiguous, or you find no trace of this person at this company, mark verified as false.

Reply ONLY JSON, no markdown:
{"verified": true or false, "confidence": "high or medium or low", "note": "what you found or didn't find, one line", "email": "verified email or null", "source_url": "URL that confirms this person's role, or null"}`

    const { text, usage, citations } = await callOpenRouter(systemPrompt, userPrompt, MODELS.observer, 400, { webSearch: true })

    let result
    try {
      result = extractJSON(text, 'object')
      if (typeof result.verified !== 'boolean') throw new Error('Malformed verification result')
    } catch (parseErr) {
      // If the verifier itself fails to produce a clean result, we do NOT auto-pass anymore —
      // fail closed, not open. An unverifiable contact should be dropped, not assumed good.
      result = { verified: false, confidence: 'low', note: 'Verifier could not confirm this contact', email: null }
    }

    res.status(200).json({
      ...result,
      email: result.email || prospect.email || null,
      citations,
      cost_usd: usage.cost_usd
    })
  } catch (err) {
    console.error('Verify API error:', err)
    // Fail closed: a verification system error means we couldn't confirm, so don't ship the contact.
    res.status(200).json({ verified: false, confidence: 'low', note: 'Verification service error — contact not confirmed', email: null, cost_usd: '0' })
  }
}
