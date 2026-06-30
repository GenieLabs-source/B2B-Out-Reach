import { getAuthedRequest } from '../../lib/auth-helper'
import { getSheetContacts, updateFollowup, updateStatus, getOrCreateSheet } from '../../lib/sheets'

export default async function handler(req, res) {
  const auth = await getAuthedRequest(req, res)
  if (!auth) return res.status(401).json({ error: 'Not signed in or session expired' })
  const { accessToken: token, googleId } = auth

  if (req.method === 'GET') {
    try {
      const sheetId = await getOrCreateSheet(token)
      const contacts = await getSheetContacts(token, sheetId)
      return res.status(200).json({ contacts, sheetId })
    } catch (err) {
      console.error('Get contacts error:', err)
      return res.status(500).json({ error: 'Could not load your contacts. Try refreshing.' })
    }
  }

  if (req.method === 'PATCH') {
    const { email, action, followupNum } = req.body || {}
    const VALID_ACTIONS = ['followup', 'replied', 'closed']
    if (!email || !VALID_ACTIONS.includes(action)) {
      return res.status(400).json({ error: 'Invalid request — email and a valid action are required' })
    }
    if (action === 'followup' && ![2, 3].includes(followupNum)) {
      return res.status(400).json({ error: 'followupNum must be 2 or 3' })
    }

    try {
      const sheetId = await getOrCreateSheet(token)
      if (action === 'followup') await updateFollowup(token, sheetId, email, followupNum)
      if (action === 'replied') await updateStatus(token, sheetId, email, 'Replied')
      if (action === 'closed') await updateStatus(token, sheetId, email, 'Closed')
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Update contact error:', err)
      return res.status(500).json({ error: 'Could not update this contact' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
