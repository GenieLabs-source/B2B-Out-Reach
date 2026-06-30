import { getAuthedRequest } from '../../lib/auth-helper'
import { callOpenRouter, MODELS } from '../../lib/openrouter'
import { createGmailDraft } from '../../lib/gmail'
import { getSenderProfile } from '../../lib/users'

function appendSignature(body, profile) {
  const signatureBlock = profile.email_signature && profile.email_signature.trim()
    ? profile.email_signature.trim()
    : profile.sender_name
  return `${body.replace(/\n?Best,?\s*$/i, '').trim()}\n\nBest,\n${signatureBlock}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await getAuthedRequest(req, res)
  if (!auth) return res.status(401).json({ error: 'Not signed in or session expired' })
  const { accessToken: token, googleId } = auth

  const { prospect } = req.body || {}
  if (!prospect || !prospect.name || !prospect.company || !prospect.email) {
    return res.status(400).json({ error: 'Invalid prospect data' })
  }

  const profile = await getSenderProfile(googleId)
  if (!profile || !profile.onboarded) {
    return res.status(400).json({
      error: 'Set up your sender profile before generating emails.',
      needsOnboarding: true
    })
  }

  try {
    const systemPrompt = `You are an expert cold email writer. Write natural, human, peer-to-peer emails. Never use em dashes. Never sound like AI. Be concise and genuine. Output ONLY raw JSON, no markdown, no backticks.`

    const proofLine = profile.proof_point
      ? `A one-line intro: "${profile.sender_name} here, ${profile.value_prop} at ${profile.company_name}. ${profile.proof_point}"`
      : `A one-line intro: "${profile.sender_name} here, ${profile.value_prop} at ${profile.company_name}."`

    const userPrompt = `Write a 4-email cold outreach sequence for this prospect:

Name: ${prospect.name}
First name: ${prospect.name.split(' ')[0]}
Role: ${prospect.role}
Company: ${prospect.company}
Company achievement: ${prospect.company_win || 'their recent growth'}
Their challenge: ${prospect.company_problem || 'scaling efficiently'}

Sender details (use these, not generic placeholders):
Sender name: ${profile.sender_name}
Sender company: ${profile.company_name}
What sender offers: ${profile.value_prop}
${profile.proof_point ? `Sender's proof point: ${profile.proof_point}` : ''}

Write 4 emails:

EMAIL 1 (primary, send now): 4 short paragraphs, under 120 words. 1) Specific genuine observation about their company achievement. 2) The challenge you noticed that relates to what the sender offers. 3) ${proofLine} 4) "Would love to swap notes for 20 minutes. No pitch, just a quick conversation."

EMAIL 2 (follow-up, day 3): Short, casual bump. References email 1 lightly without repeating it. Under 60 words. Something like checking back in, still relevant, no pressure tone.

EMAIL 3 (follow-up, day 7): Slightly different angle than email 1 — a new specific reason to talk, or a quick useful insight related to their challenge. Under 80 words.

EMAIL 4 (follow-up, day 12): Final, brief, low-pressure close — "should I close the loop on this" tone, leaves door open. Under 50 words.

Rules for ALL emails: subject line uses their first name, max 8 words, no em dashes, creates curiosity, each subject must be different from the others. No bullet points. Natural human tone. No AI-sounding phrases. End each email body with just "Best," on its own line — do NOT add a full signature block, name, title, or contact details after it.

Return ONLY JSON, no markdown:
{
  "primary": {"subject": "...", "body": "..."},
  "followup1": {"subject": "...", "body": "..."},
  "followup2": {"subject": "...", "body": "..."},
  "followup3": {"subject": "...", "body": "..."}
}`

    const { text, usage } = await callOpenRouter(systemPrompt, userPrompt, MODELS.email, 1800)

    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('Email agent returned an unexpected format')
    const sequence = JSON.parse(clean.slice(start, end + 1))

    for (const key of ['primary', 'followup1', 'followup2', 'followup3']) {
      if (!sequence[key]?.subject || !sequence[key]?.body) {
        throw new Error(`Email agent response missing ${key}`)
      }
    }

    const primaryBody = appendSignature(sequence.primary.body, profile)
    const followup1Body = appendSignature(sequence.followup1.body, profile)
    const followup2Body = appendSignature(sequence.followup2.body, profile)
    const followup3Body = appendSignature(sequence.followup3.body, profile)

    let gmailDraftId = null
    let draftError = null
    try {
      gmailDraftId = await createGmailDraft(token, {
        to: prospect.email,
        subject: sequence.primary.subject,
        body: primaryBody
      })
    } catch (gErr) {
      console.error('Gmail draft creation failed:', gErr.message)
      draftError = 'Email written but could not be saved as a Gmail draft. You can copy it manually.'
    }

    res.status(200).json({
      subject: sequence.primary.subject,
      body: primaryBody,
      gmailDraftId,
      draftError,
      followup1: { subject: sequence.followup1.subject, body: followup1Body },
      followup2: { subject: sequence.followup2.subject, body: followup2Body },
      followup3: { subject: sequence.followup3.subject, body: followup3Body },
      cost_usd: usage.cost_usd
    })
  } catch (err) {
    console.error('Write email error:', err)
    res.status(500).json({ error: 'Failed to write the email. Please try again.' })
  }
}
