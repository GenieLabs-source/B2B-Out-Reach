import { supabase } from './supabase'

export async function getContacts(userId) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getContactByEmail(userId, email) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('email', email.toLowerCase())
    .single()

  if (error) throw error
  return data
}

export async function isDuplicateContact(userId, email) {
  const { data } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('email', email.toLowerCase())
    .maybeSingle()
  return !!data
}

export async function getExistingCompanyNames(userId) {
  const { data } = await supabase
    .from('contacts')
    .select('company')
    .eq('user_id', userId)
  return [...new Set((data || []).map(c => c.company.toLowerCase()))]
}

// Saves the contact along with all 4 pre-generated emails (primary + 3 followups).
// emailSequence = { subject, body, followup1: {subject, body}, followup2: {...}, followup3: {...} }
export async function saveContact(userId, contact, gmailDraftId, emailSequence) {
  const { error } = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      company: contact.company,
      name: contact.name,
      email: contact.email.toLowerCase(),
      role: contact.role,
      stage: contact.stage,
      country: contact.country,
      industry: contact.industry,
      gmail_draft_id: gmailDraftId || null,
      sent1_at: new Date().toISOString(),
      status: 'Sent',
      primary_subject: emailSequence?.subject || null,
      primary_body: emailSequence?.body || null,
      followup1_subject: emailSequence?.followup1?.subject || null,
      followup1_body: emailSequence?.followup1?.body || null,
      followup2_subject: emailSequence?.followup2?.subject || null,
      followup2_body: emailSequence?.followup2?.body || null,
      followup3_subject: emailSequence?.followup3?.subject || null,
      followup3_body: emailSequence?.followup3?.body || null
    })

  if (error) throw error
}

export async function updateFollowupContent(userId, email, followupNum, subject, body) {
  const subjectField = `followup${followupNum}_subject`
  const bodyField = `followup${followupNum}_body`

  const { error } = await supabase
    .from('contacts')
    .update({ [subjectField]: subject, [bodyField]: body })
    .eq('user_id', userId)
    .eq('email', email.toLowerCase())

  if (error) throw error
}

export async function recordFollowupSent(userId, email, followupNum, gmailDraftId) {
  const dateField = followupNum === 1 ? 'sent2_at' : 'sent3_at'
  const draftField = `followup${followupNum}_draft_id`
  const status = followupNum === 1 ? 'Follow-up 2 Sent' : 'Follow-up 3 Sent'

  const { error } = await supabase
    .from('contacts')
    .update({ [dateField]: new Date().toISOString(), [draftField]: gmailDraftId || undefined, status })
    .eq('user_id', userId)
    .eq('email', email.toLowerCase())

  if (error) throw error
}

export async function updateContactStatus(userId, email, status) {
  const { error } = await supabase
    .from('contacts')
    .update({ status })
    .eq('user_id', userId)
    .eq('email', email.toLowerCase())

  if (error) throw error
}

// Finds contacts whose next followup is due tomorrow (so a Gmail draft can be created 1 day ahead).
// followupNum: 1 -> sent2 (due 3 days after sent1), 2 -> sent3 (due 7 days after sent2)
export async function getContactsDueForFollowupDraft(userId) {
  const contacts = await getContacts(userId)
  const due = []

  for (const c of contacts) {
    if (c.status === 'Replied' || c.status === 'Closed') continue

    if (!c.sent2_at && !c.followup1_draft_id && c.sent1_at) {
      const daysSince = Math.floor((Date.now() - new Date(c.sent1_at)) / 86400000)
      if (daysSince >= 2) due.push({ ...c, followupNum: 1 }) // draft 1 day before day-3 send
    } else if (c.sent2_at && !c.sent3_at && !c.followup2_draft_id) {
      const daysSince = Math.floor((Date.now() - new Date(c.sent2_at)) / 86400000)
      if (daysSince >= 3) due.push({ ...c, followupNum: 2 }) // draft 1 day before day-7-after-f1 send
    }
  }

  return due
}
