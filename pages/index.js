import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import OnboardingModal from '../components/OnboardingModal'

// ---- Design tokens (Apple OS inspired: neutral surfaces, single accent, subtle depth) ----
const ACCENT = '#A1003d'
const ACCENT_DARK = '#5e0023'
const ACCENT_DARKEST = '#180008'
const BRAND = `linear-gradient(135deg, ${ACCENT_DARKEST} 0%, ${ACCENT_DARK} 60%, ${ACCENT} 100%)`
const SURFACE = '#ffffff'
const CANVAS = '#f5f5f7'          // Apple's signature near-white canvas
const BORDER = '#e5e5e7'
const TEXT_PRIMARY = '#1d1d1f'    // Apple's near-black
const TEXT_SECONDARY = '#6e6e73'  // Apple's secondary gray
const TEXT_TERTIARY = '#86868b'
const SHADOW_SM = '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)'
const SHADOW_MD = '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
const RADIUS = 12

// Common presets shown as quick-add chips — not an exhaustive whitelist.
// Users can type any value via the "+ Add" input below each section.
const STAGE_PRESETS = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Bootstrapped', 'Public']
const GEO_PRESETS = ['India', 'USA', 'UK', 'EU', 'UAE', 'Canada', 'Australia', 'Singapore', 'Southeast Asia', 'LATAM', 'Africa', 'Global']
const INDUSTRY_PRESETS = ['B2B SaaS', 'HR Tech', 'Fintech', 'EdTech', 'Dev Tools', 'Healthtech', 'E-commerce', 'Martech', 'Cybersecurity', 'Logistics', 'Climate Tech', 'AI/ML', 'Legal Tech', 'Real Estate Tech']

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stages, setStages] = useState(['Series A', 'Series B'])
  const [geos, setGeos] = useState(['India', 'USA'])
  const [industries, setIndustries] = useState(['B2B SaaS'])
  const [count, setCount] = useState(10)
  const [running, setRunning] = useState(false)
  const [runStatusMessage, setRunStatusMessage] = useState('')
  const [lastRunSummary, setLastRunSummary] = useState(null)
  const [contacts, setContacts] = useState([])
  const [tab, setTab] = useState('agent')
  const [exportStatus, setExportStatus] = useState(null)
  const [agentStatus, setAgentStatus] = useState({ research: 'idle', observer: 'idle', email: 'idle' })
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      loadContacts()
      loadProfile()
    }
  }, [status])

  const loadProfile = async () => {
    setProfileLoading(true)
    try {
      const res = await fetch('/api/profile')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setProfile(data.profile)
    } catch (e) {
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const loadContacts = async () => {
    const res = await fetch('/api/contacts')
    if (res.status === 401) { router.push('/login'); return }
    if (!res.ok) return
    const data = await res.json()
    if (data.contacts) setContacts(data.contacts)
  }

  const runAgents = async () => {
    if (!profile || !profile.onboarded) {
      setRunStatusMessage('')
      return
    }
    if (!stages.length || !geos.length) {
      return
    }
    setRunning(true); setLastRunSummary(null)
    let cost = 0

    setAgentStatus({ research: 'running', observer: 'idle', email: 'idle' })
    setRunStatusMessage('Searching for matching companies…')

    const resRes = await fetch('/api/research', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stages, geos, industries, count })
    })
    const resData = await resRes.json()
    if (resData.error) {
      setAgentStatus(s => ({ ...s, research: 'error' }))
      setRunStatusMessage(resData.error)
      setRunning(false)
      return
    }
    cost += parseFloat(resData.usage?.cost_usd || 0)
    setAgentStatus(s => ({ ...s, research: 'done', observer: 'running' }))

    const verified = []
    for (let i = 0; i < resData.prospects.length; i++) {
      const p = resData.prospects[i]
      setRunStatusMessage(`Verifying ${i + 1} of ${resData.prospects.length}…`)
      const vRes = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prospect: p }) })
      const vData = await vRes.json()
      cost += parseFloat(vData.cost_usd || 0)
      if (vData.verified) {
        verified.push({ ...p, email: vData.corrected_email || p.email })
      }
    }

    setAgentStatus(s => ({ ...s, observer: 'done', email: 'running' }))

    if (verified.length === 0) {
      setAgentStatus(s => ({ ...s, email: 'done' }))
      setLastRunSummary({ count: 0, cost: cost.toFixed(4) })
      setRunStatusMessage('')
      await loadContacts()
      setRunning(false)
      return
    }

    let savedCount = 0

    for (let i = 0; i < verified.length; i++) {
      const p = verified[i]
      setRunStatusMessage(`Writing emails ${i + 1} of ${verified.length}…`)
      const writeRes = await fetch('/api/write-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect: p })
      })
      const writeData = await writeRes.json()

      if (!writeRes.ok) continue
      cost += parseFloat(writeData.cost_usd || 0)

      const saveRes = await fetch('/api/save-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: p,
          gmailDraftId: writeData.gmailDraftId,
          emailSequence: {
            subject: writeData.subject,
            body: writeData.body,
            followup1: writeData.followup1,
            followup2: writeData.followup2,
            followup3: writeData.followup3
          }
        })
      })

      if (saveRes.ok) savedCount++
    }

    setAgentStatus(s => ({ ...s, email: 'done' }))
    setLastRunSummary({ count: savedCount, cost: cost.toFixed(4) })
    setRunStatusMessage('')
    await loadContacts()
    setRunning(false)
  }

  const daysAgo = (isoString) => {
    if (!isoString) return 0
    return Math.floor((Date.now() - new Date(isoString)) / 86400000)
  }

  const needsFollowup = (c) => {
    if (c.status === 'Replied' || c.status === 'Closed') return null
    if (!c.sent2_at && daysAgo(c.sent1_at) >= 3) return 2
    if (c.sent2_at && !c.sent3_at && daysAgo(c.sent2_at) >= 4) return 3
    return null
  }

  const exportToSheets = async () => {
    setExportStatus('exporting')
    try {
      const res = await fetch('/api/export-sheet', { method: 'POST' })
      const data = await res.json()
      setExportStatus(res.ok ? { success: true, ...data } : { success: false, error: data.error })
    } catch (e) {
      setExportStatus({ success: false, error: e.message })
    }
  }

  const dueCount = contacts.filter(c => needsFollowup(c)).length
  const repliedCount = contacts.filter(c => c.status === 'Replied').length
  const canRun = stages.length > 0 && geos.length > 0 && industries.length > 0 && !running

  if (status === 'loading' || status === 'unauthenticated' || profileLoading) {
    return (
      <div style={{ minHeight: '100vh', background: CANVAS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: TEXT_TERTIARY, fontSize: 13 }}>Loading</div>
      </div>
    )
  }

  const statusDot = (s) => {
    const map = { running: '#ff9f0a', done: '#34c759', error: '#ff3b30', idle: '#d2d2d7' }
    return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: map[s] || map.idle, marginRight: 8, flexShrink: 0 }} />
  }

  const navItem = (key, label, badge) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '9px 12px', marginBottom: 2,
        border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
        background: tab === key ? '#f0f0f2' : 'transparent',
        color: tab === key ? TEXT_PRIMARY : TEXT_SECONDARY,
        fontSize: 14, fontWeight: tab === key ? 600 : 400,
        transition: 'background 0.12s ease'
      }}
    >
      <span>{label}</span>
      {badge > 0 && (
        <span style={{ fontSize: 11, fontWeight: 600, background: ACCENT, color: '#fff', borderRadius: 10, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <>
      {(!profile || !profile.onboarded) && (
        <OnboardingModal onComplete={loadProfile} existing={profile} />
      )}
      <Head>
        <title>Leads Genie</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: CANVAS, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif', display: 'flex' }}>

        {/* ---------- Sidebar (Apple Mail / Finder style) ---------- */}
        <div style={{ width: 220, minWidth: 220, background: SURFACE, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', padding: '1.25rem 0.75rem', position: 'sticky', top: 0, height: '100vh' }}>
          <div style={{ padding: '0 0.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>L</span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.1 }}>Leads Genie</p>
                <p style={{ fontSize: 10, color: TEXT_TERTIARY, lineHeight: 1.1, marginTop: 1 }}>Lite</p>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {navItem('agent', 'Agent')}
            {navItem('outreach', 'Outreach', dueCount)}
            {navItem('profile', 'Profile')}
            <Link href="/pricing" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '9px 12px', fontSize: 14, color: TEXT_SECONDARY, borderRadius: 8, cursor: 'pointer' }}>Pricing</div>
            </Link>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '0.75rem' }}>
            {session?.user?.email && (
              <p style={{ fontSize: 11, color: TEXT_TERTIARY, padding: '0 12px', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.user.email}
              </p>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 14, color: TEXT_SECONDARY, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* ---------- Main content ---------- */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Status strip — single line, muted, not competing for attention */}
          <div style={{ borderBottom: `1px solid ${BORDER}`, background: SURFACE, padding: '10px 2rem' }}>
            <p style={{ fontSize: 12, color: TEXT_TERTIARY }}>
              <span style={{ color: '#34c759' }}>●</span>&nbsp; Connected — contacts saved to your CRM, drafts created in your Gmail
            </p>
          </div>

          <div style={{ maxWidth: 1040, padding: '2rem' }}>

            {tab === 'agent' && (
              <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>

                {/* Left column: configuration + agents */}
                <div>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: RADIUS, padding: '1.5rem', marginBottom: '1rem', boxShadow: SHADOW_SM }}>
                    <p style={{ fontSize: 17, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 18, letterSpacing: '-0.01em' }}>New search</p>

                    <TagSelector label="Funding stage" presets={STAGE_PRESETS} selected={stages} setSelected={setStages} placeholder="e.g. Series E, growth-stage…" />
                    <TagSelector label="Geography" presets={GEO_PRESETS} selected={geos} setSelected={setGeos} placeholder="e.g. Germany, Japan, LATAM…" />
                    <TagSelector label="Industry" presets={INDUSTRY_PRESETS} selected={industries} setSelected={setIndustries} placeholder="e.g. Insurtech, Web3, Travel…" />

                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 12, color: TEXT_TERTIARY, marginBottom: 8, fontWeight: 500 }}>Prospects per run</p>
                      <select
                        value={count}
                        onChange={e => setCount(parseInt(e.target.value))}
                        style={{ fontSize: 14, padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, width: '100%', background: '#f9f9fa', color: TEXT_PRIMARY }}
                      >
                        {[5, 10, 15].map(n => <option key={n} value={n}>{n} prospects</option>)}
                      </select>
                    </div>

                    {/* Fitts's Law: this is the largest, most prominent target on the page */}
                    <button
                      onClick={runAgents}
                      disabled={!canRun}
                      style={{
                        width: '100%', padding: '13px', fontSize: 15, fontWeight: 600,
                        background: !canRun ? '#e8e8ea' : BRAND,
                        color: !canRun ? TEXT_TERTIARY : '#fff',
                        border: 'none', borderRadius: 10, cursor: !canRun ? 'not-allowed' : 'pointer',
                        boxShadow: !canRun ? 'none' : SHADOW_MD,
                        transition: 'transform 0.1s ease'
                      }}
                    >
                      {running ? 'Running…' : 'Run agents'}
                    </button>
                    {lastRunSummary && (
                      <p style={{ fontSize: 11, color: TEXT_TERTIARY, textAlign: 'center', marginTop: 10 }}>
                        ${lastRunSummary.cost} this run
                      </p>
                    )}
                  </div>

                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: RADIUS, padding: '1.5rem', boxShadow: SHADOW_SM }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: TEXT_TERTIARY, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pipeline</p>
                    {[
                      { key: 'research', label: 'Research', desc: 'Finding prospects' },
                      { key: 'observer', label: 'Verify', desc: 'Checking employment' },
                      { key: 'email', label: 'Email', desc: 'Writing & drafting' }
                    ].map((a, i) => (
                      <div key={a.key} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
                        {statusDot(agentStatus[a.key])}
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY }}>{a.label}</p>
                          <p style={{ fontSize: 11, color: TEXT_TERTIARY }}>{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column: brief run status only — no log feed, no email cards */}
                <div>
                  {running && (
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: RADIUS, padding: '1.5rem', boxShadow: SHADOW_SM, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ff9f0a', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>{runStatusMessage || 'Working…'}</p>
                        <p style={{ fontSize: 12, color: TEXT_TERTIARY, marginTop: 2 }}>This usually takes 1-2 minutes</p>
                      </div>
                    </div>
                  )}

                  {!running && lastRunSummary && (
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: RADIUS, padding: '1.5rem', boxShadow: SHADOW_SM }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 6 }}>
                        {lastRunSummary.count} prospect{lastRunSummary.count !== 1 ? 's' : ''} added
                      </p>
                      <p style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 14 }}>
                        Gmail drafts created · ${lastRunSummary.cost} this run
                      </p>
                      <button
                        onClick={() => setTab('outreach')}
                        style={{ fontSize: 13, fontWeight: 600, padding: '9px 18px', background: BRAND, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      >
                        View in Outreach
                      </button>
                    </div>
                  )}

                  {!running && !lastRunSummary && (
                    // Empty state designed as an invitation, not a dead end
                    <div style={{ background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: RADIUS, padding: '3.5rem 2rem', textAlign: 'center' }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 6 }}>No search yet</p>
                      <p style={{ fontSize: 13, color: TEXT_TERTIARY, maxWidth: 320, margin: '0 auto' }}>
                        Pick a stage and geography on the left, then run agents to find your first verified prospects.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'outreach' && (
              <OutreachTab
                contacts={contacts}
                onSaved={loadContacts}
                exportToSheets={exportToSheets}
                exportStatus={exportStatus}
                dueCount={dueCount}
                repliedCount={repliedCount}
                needsFollowup={needsFollowup}
                daysAgo={daysAgo}
                onRunAgent={() => setTab('agent')}
              />
            )}

            {tab === 'profile' && <ProfileTab profile={profile} onSaved={loadProfile} />}
          </div>
        </div>
      </div>
    </>
  )
}

function ProfileTab({ profile, onSaved }) {
  const [companyName, setCompanyName] = useState(profile?.company_name || '')
  const [senderName, setSenderName] = useState(profile?.sender_name || profile?.name || '')
  const [valueProp, setValueProp] = useState(profile?.value_prop || '')
  const [proofPoint, setProofPoint] = useState(profile?.proof_point || '')
  const [emailSignature, setEmailSignature] = useState(profile?.email_signature || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const canSave = companyName.trim() && senderName.trim() && valueProp.trim()

  const save = async () => {
    if (!canSave) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, senderName, valueProp, proofPoint, emailSignature })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setSaving(false); return }
      setSaved(true)
      await onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (label, value, setValue, placeholder, optional, multiline) => (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: TEXT_TERTIARY, marginBottom: 6, display: 'block' }}>
          {label}{optional && <span style={{ fontWeight: 400 }}> (optional)</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => { setValue(e.target.value); setSaved(false) }}
          placeholder={placeholder}
          rows={4}
          style={{ width: '100%', fontSize: 14, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: '#f9f9fa', color: TEXT_PRIMARY, fontFamily: 'inherit', resize: 'vertical' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => { setValue(e.target.value); setSaved(false) }}
          placeholder={placeholder}
          style={{ width: '100%', fontSize: 14, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: '#f9f9fa', color: TEXT_PRIMARY }}
        />
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY, letterSpacing: '-0.02em', marginBottom: 4 }}>Profile</p>
      <p style={{ fontSize: 13, color: TEXT_TERTIARY, marginBottom: 24 }}>
        This is used to write your outreach emails. Only you see this — it's never shared with other users.
      </p>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: RADIUS, padding: '1.5rem', boxShadow: SHADOW_SM }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>About you</p>
        {field('Your name', senderName, setSenderName, 'e.g. Priya Sharma')}
        {field('Your company', companyName, setCompanyName, 'e.g. Acme Consulting')}
        {field('What you offer', valueProp, setValueProp, 'e.g. GTM consulting for B2B SaaS companies')}
        {field('Your proof point', proofPoint, setProofPoint, 'e.g. Helped a client cut CAC by 40%', true)}
      </div>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: RADIUS, padding: '1.5rem', boxShadow: SHADOW_SM, marginTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email signature</p>
        <p style={{ fontSize: 12, color: TEXT_TERTIARY, marginBottom: 14 }}>Appended to the end of every drafted email, after "Best,". Plain text only — phone, title, links, etc.</p>
        {field(null, emailSignature, setEmailSignature, 'Priya Sharma\nFounder, Acme Consulting\n+91 98765 43210\nacmeconsulting.com', true, true)}
      </div>

      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 12 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <button
          onClick={save}
          disabled={!canSave || saving}
          style={{
            padding: '11px 24px', fontSize: 14, fontWeight: 600,
            background: !canSave || saving ? '#e8e8ea' : BRAND,
            color: !canSave || saving ? TEXT_TERTIARY : '#fff',
            border: 'none', borderRadius: 10, cursor: !canSave || saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span style={{ fontSize: 13, color: '#1a7d3a' }}>Saved</span>}
      </div>
    </div>
  )
}

const SAFE_TAG = /^[A-Za-z0-9 ,&'\-]{1,60}$/

function TagSelector({ label, presets, selected, setSelected, placeholder }) {
  const [customInput, setCustomInput] = useState('')
  const [inputError, setInputError] = useState('')

  const toggle = (val) => {
    setSelected(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  const addCustom = () => {
    const val = customInput.trim()
    if (!val) return
    if (!SAFE_TAG.test(val)) {
      setInputError('Use letters, numbers, and basic punctuation only')
      return
    }
    if (selected.some(s => s.toLowerCase() === val.toLowerCase())) {
      setInputError('Already added')
      return
    }
    if (selected.length >= 8) {
      setInputError('Max 8 selections')
      return
    }
    setSelected([...selected, val])
    setCustomInput('')
    setInputError('')
  }

  const customSelected = selected.filter(s => !presets.includes(s))

  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 12, color: '#86868b', marginBottom: 8, fontWeight: 500 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {presets.map(p => (
          <button
            key={p}
            onClick={() => toggle(p)}
            style={{
              fontSize: 13, padding: '6px 13px', borderRadius: 8, border: 'none',
              background: selected.includes(p) ? '#A1003d' : '#f0f0f2',
              color: selected.includes(p) ? '#fff' : '#1d1d1f',
              cursor: 'pointer', fontWeight: 500
            }}
          >
            {p}
          </button>
        ))}
        {customSelected.map(c => (
          <button
            key={c}
            onClick={() => toggle(c)}
            style={{
              fontSize: 13, padding: '6px 10px 6px 13px', borderRadius: 8, border: 'none',
              background: '#A1003d', color: '#fff', cursor: 'pointer', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {c}
            <span style={{ opacity: 0.7, fontSize: 11 }}>✕</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={customInput}
          onChange={e => { setCustomInput(e.target.value); setInputError('') }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder={placeholder}
          maxLength={60}
          style={{ flex: 1, fontSize: 13, padding: '7px 10px', border: '1px solid #e5e5e7', borderRadius: 8, background: '#f9f9fa', color: '#1d1d1f' }}
        />
        <button
          onClick={addCustom}
          style={{ fontSize: 13, padding: '7px 14px', border: '1px solid #e5e5e7', background: '#fff', color: '#1d1d1f', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
        >
          Add
        </button>
      </div>
      {inputError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 5 }}>{inputError}</p>}
    </div>
  )
}

// ---- Outreach tab: table of contacts with Primary + 3 Followup email columns ----
function OutreachTab({ contacts, onSaved, exportToSheets, exportStatus, dueCount, repliedCount, needsFollowup, daysAgo, onRunAgent }) {
  const [modalContact, setModalContact] = useState(null)
  const [modalType, setModalType] = useState(null) // 'primary' | 'followup1' | 'followup2' | 'followup3'

  const openModal = (contact, type) => { setModalContact(contact); setModalType(type) }
  const closeModal = () => { setModalContact(null); setModalType(null) }

  const handleStatus = async (c, action) => {
    await fetch('/api/contacts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: c.email, action }) })
    await onSaved()
  }

  const snippet = (text, len = 70) => {
    if (!text) return '—'
    const clean = text.replace(/\n+/g, ' ').trim()
    return clean.length > len ? clean.slice(0, len) + '…' : clean
  }

  const cellButton = (text, onClick, color) => (
    <button
      onClick={onClick}
      style={{
        fontSize: 12.5, color: color || '#1d1d1f', background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}
      title={text}
    >
      {snippet(text)}
    </button>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>Outreach</p>
        <button
          onClick={exportToSheets}
          disabled={exportStatus === 'exporting' || contacts.length === 0}
          style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', border: '1px solid #e5e5e7', background: '#fff', color: '#1d1d1f', borderRadius: 8, cursor: contacts.length === 0 ? 'not-allowed' : 'pointer', opacity: contacts.length === 0 ? 0.4 : 1 }}
        >
          {exportStatus === 'exporting' ? 'Exporting…' : 'Export to Sheets'}
        </button>
      </div>

      {exportStatus && exportStatus !== 'exporting' && (
        <div style={{ background: exportStatus.success ? '#f0fbf3' : '#fef2f2', border: `1px solid ${exportStatus.success ? '#bbf0c8' : '#fecaca'}`, borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 12.5, color: exportStatus.success ? '#1a7d3a' : '#dc2626' }}>
          {exportStatus.success
            ? <>Exported {exportStatus.exported} new contact{exportStatus.exported !== 1 ? 's' : ''} ({exportStatus.total} total). <a href={exportStatus.sheetUrl} target="_blank" rel="noreferrer" style={{ color: '#1a7d3a', fontWeight: 600 }}>Open sheet →</a></>
            : `Export failed: ${exportStatus.error}`}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: contacts.length },
          { label: 'Follow-up due', val: dueCount, accent: dueCount > 0 },
          { label: 'Replied', val: repliedCount },
          { label: 'Reply rate', val: contacts.length > 0 ? Math.round((repliedCount / contacts.length) * 100) + '%' : '0%' }
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e5e7', borderRadius: 12, padding: '1.1rem 1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 12, color: '#86868b', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.accent ? '#A1003d' : '#1d1d1f', letterSpacing: '-0.02em' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {contacts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e5e5e7', borderRadius: 12, padding: '3.5rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>No contacts yet</p>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 16 }}>Run the agent to find and save your first prospects here.</p>
          <button onClick={onRunAgent} style={{ fontSize: 13, fontWeight: 600, padding: '9px 18px', background: 'linear-gradient(135deg, #180008 0%, #5e0023 60%, #A1003d 100%)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Go to Agent
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e5e7', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e7', background: '#fafafa' }}>
                  {['Company', 'POC', 'Designation', 'Stage', 'Status', 'Primary Email', 'Follow-up 1', 'Follow-up 2', 'Follow-up 3'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => {
                  const fu = needsFollowup(c)
                  return (
                    <tr key={i} style={{ borderBottom: i < contacts.length - 1 ? '1px solid #f0f0f2' : 'none' }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#1d1d1f', whiteSpace: 'nowrap' }}>{c.company}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#1d1d1f', whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#6e6e73', whiteSpace: 'nowrap' }}>{c.role}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: '#f0f0f2', color: '#6e6e73', whiteSpace: 'nowrap' }}>{c.stage}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: c.status === 'Replied' ? '#e8f8ec' : fu ? '#fff4e0' : '#f0f0f2', color: c.status === 'Replied' ? '#1a7d3a' : fu ? '#bf6c00' : '#6e6e73', whiteSpace: 'nowrap' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                        {cellButton(c.primary_subject, () => openModal(c, 'primary'), '#A1003d')}
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                        {cellButton(c.followup1_subject, () => openModal(c, 'followup1'))}
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                        {cellButton(c.followup2_subject, () => openModal(c, 'followup2'))}
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                        {cellButton(c.followup3_subject, () => openModal(c, 'followup3'))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalContact && (
        <EmailModal
          contact={modalContact}
          type={modalType}
          onClose={closeModal}
          onSaved={async () => { await onSaved(); closeModal() }}
          onStatusChange={handleStatus}
        />
      )}
    </>
  )
}

function EmailModal({ contact, type, onClose, onSaved, onStatusChange }) {
  const isPrimary = type === 'primary'
  const followupNum = type === 'followup1' ? 1 : type === 'followup2' ? 2 : 3

  const initialSubject = contact[`${isPrimary ? 'primary' : type}_subject`] || ''
  const initialBody = contact[`${isPrimary ? 'primary' : type}_body`] || ''

  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveEdit = async () => {
    setSaving(true)
    try {
      await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact.email, action: 'edit_followup', followupNum, subject, body })
      })
      setSaved(true)
      await onSaved()
    } finally {
      setSaving(false)
    }
  }

  const dueLabel = type === 'followup1' ? 'Sends day 3' : type === 'followup2' ? 'Sends day 7' : type === 'followup3' ? 'Sends day 12' : 'Sent now'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isPrimary ? 'Primary email' : `Follow-up ${followupNum}`}
            </p>
            <p style={{ fontSize: 12, color: '#A1003d', marginTop: 2 }}>{dueLabel} · {contact.name} at {contact.company}</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, color: '#86868b', cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {isPrimary ? (
          <>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginTop: 16, marginBottom: 10 }}>{subject}</p>
            <p style={{ fontSize: 13.5, color: '#3a3a3c', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{body}</p>
            {contact.gmail_draft_id && (
              <a href="https://mail.google.com/mail/u/0/#drafts" target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: '#A1003d', textDecoration: 'none' }}>
                Open in Gmail →
              </a>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f2' }}>
              {contact.status !== 'Replied' && (
                <button onClick={() => onStatusChange(contact, 'replied')} style={{ fontSize: 12, padding: '7px 14px', border: '1px solid #e5e5e7', background: '#fff', color: '#1d1d1f', borderRadius: 7, cursor: 'pointer' }}>Mark replied</button>
              )}
              {contact.status !== 'Closed' && (
                <button onClick={() => onStatusChange(contact, 'closed')} style={{ fontSize: 12, padding: '7px 14px', border: '1px solid #e5e5e7', background: '#fff', color: '#1d1d1f', borderRadius: 7, cursor: 'pointer' }}>Close</button>
              )}
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 12, color: '#86868b', marginTop: 16, marginBottom: 14, lineHeight: 1.5 }}>
              This will be created as a Gmail draft automatically, one day before it's due. Edit it now if you'd like.
            </p>
            <label style={{ fontSize: 11, fontWeight: 500, color: '#86868b', marginBottom: 5, display: 'block' }}>Subject</label>
            <input
              value={subject}
              onChange={e => { setSubject(e.target.value); setSaved(false) }}
              style={{ width: '100%', fontSize: 14, padding: '9px 12px', border: '1px solid #e5e5e7', borderRadius: 8, background: '#f9f9fa', color: '#1d1d1f', marginBottom: 14 }}
            />
            <label style={{ fontSize: 11, fontWeight: 500, color: '#86868b', marginBottom: 5, display: 'block' }}>Body</label>
            <textarea
              value={body}
              onChange={e => { setBody(e.target.value); setSaved(false) }}
              rows={9}
              style={{ width: '100%', fontSize: 13.5, padding: '10px 12px', border: '1px solid #e5e5e7', borderRadius: 8, background: '#f9f9fa', color: '#1d1d1f', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button
                onClick={saveEdit}
                disabled={saving}
                style={{ fontSize: 13, fontWeight: 600, padding: '9px 18px', background: saving ? '#e8e8ea' : 'linear-gradient(135deg, #180008 0%, #5e0023 60%, #A1003d 100%)', color: saving ? '#86868b' : '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {saved && <span style={{ fontSize: 13, color: '#1a7d3a' }}>Saved</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
