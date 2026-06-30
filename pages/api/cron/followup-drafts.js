// This endpoint is meant to be called by a daily cron (Vercel Cron or external scheduler).
// It finds contacts whose follow-up is due tomorrow and creates a Gmail draft now,
// using whatever subject/body is currently saved (including any user edits).
//
// SECURITY: protected by a shared secret since this has no user session —
// it iterates across all users system-wide.

import { supabase } from '../../../lib/supabase'
import { createGmailDraft } from '../../../lib/gmail'
import { getContactsDueForFollowupDraft, recordFollowupSent } from '../../../lib/contacts'
import { google } from 'googleapis'

async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Token refresh failed')
  return data.access_token
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // NOTE: this requires storing each user's refresh token at the account level
  // (separate from the per-session JWT). That table/column does not exist yet —
  // see accompanying note in the response for the manual step required.
  const { data: users, error } = await supabase
    .from('users')
    .select('id, google_id, google_refresh_token')
    .not('google_refresh_token', 'is', null)

  if (error) return res.status(500).json({ error: error.message })

  const results = []

  for (const user of users || []) {
    try {
      const accessToken = await refreshAccessToken(user.google_refresh_token)
      const due = await getContactsDueForFollowupDraft(user.id)

      for (const contact of due) {
        const num = contact.followupNum
        const subject = contact[`followup${num}_subject`]
        const body = contact[`followup${num}_body`]
        if (!subject || !body) continue

        const draftId = await createGmailDraft(accessToken, {
          to: contact.email,
          subject,
          body
        })

        await recordFollowupSent(user.id, contact.email, num, draftId)
        results.push({ user: user.google_id, contact: contact.email, followupNum: num, draftId })
      }
    } catch (err) {
      console.error(`Cron failed for user ${user.google_id}:`, err.message)
      results.push({ user: user.google_id, error: err.message })
    }
  }

  res.status(200).json({ processed: results.length, results })
}
