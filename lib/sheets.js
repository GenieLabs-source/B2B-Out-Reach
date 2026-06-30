import { google } from 'googleapis'

const SHEET_TITLE = 'Leads Genie — Contacts'

const HEADERS = [
  'Company Name',
  "Contact Person's Name",
  "Contact Person's Email Id",
  'Role',
  'Funding Stage',
  'Country',
  '1st Email Sent',
  '2nd Followup Email Sent',
  '3rd Followup Email Sent',
  'Status',
  'Notes'
]

// SECURITY: prevent Google Sheets / CSV formula injection.
// If a cell value starts with =, +, -, @, or a tab/CR, Sheets may interpret it as a formula,
// which can be exploited (e.g. =IMPORTXML(...) to exfiltrate data) if AI-generated content
// is ever malformed or adversarially crafted. Prefixing with a single quote forces text mode.
function sanitizeCell(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/^[=+\-@\t\r]/.test(str)) return `'${str}`
  return str
}

function sanitizeRow(row) {
  return row.map(sanitizeCell)
}

function getClient(accessToken) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.sheets({ version: 'v4', auth })
}

function getDrive(accessToken) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth })
}

export async function getOrCreateSheet(accessToken) {
  const drive = getDrive(accessToken)
  const search = await drive.files.list({
    q: `name='${SHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)'
  })
  if (search.data.files.length > 0) return search.data.files[0].id
  const sheets = getClient(accessToken)
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SHEET_TITLE },
      sheets: [{
        properties: { title: 'Contacts' },
        data: [{ startRow: 0, startColumn: 0, rowData: [{ values: HEADERS.map(h => ({ userEnteredValue: { stringValue: h } })) }] }]
      }]
    }
  })
  return created.data.spreadsheetId
}

export async function getSheetContacts(accessToken, sheetId) {
  const sheets = getClient(accessToken)
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Contacts!A:K' })
  const rows = res.data.values || []
  if (rows.length <= 1) return []
  return rows.slice(1).map(row => ({
    company: row[0] || '', name: row[1] || '', email: row[2] || '',
    role: row[3] || '', stage: row[4] || '', country: row[5] || '',
    sent1: row[6] || '', sent2: row[7] || '', sent3: row[8] || '',
    status: row[9] || 'Sent', notes: row[10] || ''
  }))
}

export async function appendContact(accessToken, sheetId, contact) {
  const sheets = getClient(accessToken)
  const today = new Date().toLocaleDateString('en-GB')
  const row = sanitizeRow([
    contact.company, contact.name, contact.email, contact.role,
    contact.stage, contact.country, today, '', '', 'Sent', ''
  ])
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId, range: 'Contacts!A:K', valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] }
  })
}

export async function updateFollowup(accessToken, sheetId, email, followupNum) {
  const sheets = getClient(accessToken)
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Contacts!A:K' })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex(r => r[2] === email)
  if (rowIndex === -1) return
  const today = new Date().toLocaleDateString('en-GB')
  const col = followupNum === 2 ? 'H' : 'I'
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: `Contacts!${col}${rowIndex + 1}`, values: [[today]] },
        { range: `Contacts!J${rowIndex + 1}`, values: [[sanitizeCell(`Follow-up ${followupNum} Sent`)]] }
      ]
    }
  })
}

export async function updateStatus(accessToken, sheetId, email, status) {
  const sheets = getClient(accessToken)
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Contacts!A:K' })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex(r => r[2] === email)
  if (rowIndex === -1) return
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Contacts!J${rowIndex + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[sanitizeCell(status)]] }
  })
}

export async function isDuplicate(accessToken, sheetId, email, preloadedContacts) {
  const contacts = preloadedContacts || await getSheetContacts(accessToken, sheetId)
  return contacts.some(c => c.email.toLowerCase() === email.toLowerCase())
}

export async function getExistingCompanies(accessToken, sheetId, preloadedContacts) {
  const contacts = preloadedContacts || await getSheetContacts(accessToken, sheetId)
  return [...new Set(contacts.map(c => c.company.toLowerCase()).filter(Boolean))]
}
