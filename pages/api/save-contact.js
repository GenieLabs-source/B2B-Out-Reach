import { getAuthedRequest } from '../../lib/auth-helper'
import { appendContact, isDuplicate, getOrCreateSheet } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const auth = await getAuthedRequest(req, res)
  if (!auth) return res.status(401).json({ error: 'Not signed in or session expired' })
  const { accessToken: token, googleId } = auth

  const { contact, sheetId } = req.body || {}
  if (!contact || typeof contact !== 'object' || !contact.email || !contact.name || !contact.company) {
    return res.status(400).json({ error: 'Invalid contact data — name, email, and company are required' })
  }

  try {
    const sid = sheetId || await getOrCreateSheet(token)
    const dup = await isDuplicate(token, sid, contact.email)
    if (dup) return res.status(409).json({ error: 'Duplicate: ' + contact.email })
    await appendContact(token, sid, contact)
    res.status(200).json({ success: true, sheetId: sid })
  } catch (err) {
    console.error('Save contact error:', err)
    res.status(500).json({ error: 'Failed to save contact to your Google Sheet' })
  }
}
