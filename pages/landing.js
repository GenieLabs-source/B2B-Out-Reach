import Head from 'next/head'
import Link from 'next/link'

const G_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C18.622 14.091 17.64 11.783 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
  </svg>
)

export default function Landing() {
  return (
    <>
      <Head>
        <title>Leads Genie — Find verified B2B prospects. Send emails that convert.</title>
        <meta name="description" content="Three AI agents research the internet, find verified prospects, and send personalised emails from your Gmail. Free to start." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { font-family: 'DM Sans', system-ui, sans-serif; background: #fff; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
          .serif { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; }
          @media (max-width: 768px) {
            .hide-mobile { display: none !important; }
            .grid-3 { grid-template-columns: 1fr !important; }
            .grid-2 { grid-template-columns: 1fr !important; }
            .hero-h1 { font-size: 42px !important; }
            .section-h2 { font-size: 32px !important; }
            .agents-grid { flex-direction: column !important; }
            .stats-bar { gap: 24px !important; }
            .step-row { flex-direction: column !important; }
            .step-row-rev { flex-direction: column !important; }
            .nav-links { display: none !important; }
            .px-section { padding-left: 24px !important; padding-right: 24px !important; }
          }
        `}</style>
      </Head>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(26,17,24,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 48px' }} className="px-section">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#c94670,#7a1f3d)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>L</span>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, color: '#fff', letterSpacing: '-0.02em' }}>Leads Genie</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: 20, marginLeft: 4 }}>by Genie Labs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
            <a href="#how-it-works" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.15s' }}>How it works</a>
            <Link href="/pricing" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/login" style={{ padding: '8px 20px', background: '#fff', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>
              Get started free
            </Link>
          </div>
          <Link href="/login" className="hide-mobile" style={{ display: 'none', padding: '8px 16px', background: '#fff', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>
            Start free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── dark, bold, from 1b */}
      <section style={{ background: '#1a1118', padding: '120px 48px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="px-section">
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(201,70,112,0.22), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, marginBottom: 36 }}>
            <div style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Three AI agents working for you right now</span>
          </div>
          <h1 className="serif hero-h1" style={{ fontSize: 68, lineHeight: 1.06, color: '#fff', letterSpacing: '-0.02em', marginBottom: 28 }}>
            You run the business.<br />
            <span style={{ color: '#c94670' }}>We fill your pipeline.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 19, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto 44px' }}>
            Describe your ideal customer. Our AI agents search the internet, find verified contacts, and draft personalised emails directly in your Gmail.
          </p>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: '#fff', borderRadius: 8, textDecoration: 'none' }}>
            {G_ICON}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Start free with Google</span>
          </Link>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 14 }}>
            No credit card · Sends from your Gmail · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: '#150f13', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 48px', textAlign: 'center' }} className="px-section">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
          Gmail compose-only access &nbsp;·&nbsp; We never read your emails &nbsp;·&nbsp; Your data stays yours &nbsp;·&nbsp; Cancel anytime
        </span>
      </div>

      {/* ── THE PROBLEM ── white, editorial from 1a */}
      <section style={{ padding: '88px 48px', background: '#faf9f7' }} className="px-section">
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#7a1f3d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>The problem</span>
            <h2 className="serif section-h2" style={{ fontSize: 42, color: '#1a1a1a', marginTop: 12, letterSpacing: '-0.02em' }}>Outreach is broken for small teams</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }} className="grid-3">
            {[
              { icon: '⏳', title: 'Hours of manual research', body: "You're Googling companies, scraping LinkedIn, copying emails into spreadsheets. The actual selling never starts." },
              { icon: '🎯', title: 'Wrong people, wrong message', body: 'Generic blasts to unverified contacts. Low open rates, spam flags, and zero replies. Your reputation takes the hit.' },
              { icon: '💸', title: 'Expensive tools, steep curves', body: "Sales platforms built for 50-person teams. You're paying $200/mo for features you'll never touch. You just need customers." },
            ].map(card => (
              <div key={card.title} style={{ padding: 32, background: '#fff', borderRadius: 12, border: '1px solid #ede9e3' }}>
                <div style={{ width: 40, height: 40, background: '#fdf2f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20 }}>{card.icon}</div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', lineHeight: 1.55 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── from 1b */}
      <section style={{ padding: '88px 48px', background: '#fff' }} className="px-section">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="serif section-h2" style={{ fontSize: 42, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              What your week looks like now<br />vs. with Leads Genie
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 16, overflow: 'hidden', border: '1px solid #ede9e3' }} className="grid-2">
            <div style={{ padding: 40, background: '#faf9f7', borderRight: '1px solid #ede9e3' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#e74c3c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Without Leads Genie</div>
              {[
                { day: 'Mon–Wed', text: 'Searching LinkedIn, scraping sites, building lead lists in spreadsheets' },
                { day: 'Thursday', text: 'Writing generic email templates, guessing at subject lines' },
                { day: 'Friday', text: '2 replies. 14 bounces. One "please unsubscribe me." Back to square one.' },
              ].map(r => (
                <div key={r.day} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ width: 20, height: 20, background: '#fee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 10, color: '#e74c3c' }}>✕</div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{r.day}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginTop: 2 }}>{r.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 40, background: '#fff' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#2e7d32', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>With Leads Genie</div>
              {[
                { day: 'Monday morning', text: '2-min setup: describe your business and ideal customer' },
                { day: 'Monday afternoon', text: '50 verified prospects found. Personalised emails written and drafted in your Gmail.' },
                { day: 'By Friday', text: '12 replies, 4 meetings booked, 1 deal closing. You spent your week doing actual work.' },
              ].map(r => (
                <div key={r.day} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ width: 20, height: 20, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: 10, color: '#2e7d32' }}>✓</div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{r.day}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginTop: 2 }}>{r.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE AGENTS ── dark horizontal pipeline from 1b */}
      <section id="how-it-works" style={{ padding: '88px 48px', background: '#1a1118' }} className="px-section">
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#c94670', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Under the hood</span>
            <h2 className="serif section-h2" style={{ fontSize: 42, color: '#fff', marginTop: 12, letterSpacing: '-0.02em' }}>Three agents. One pipeline. Zero effort.</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }} className="agents-grid">
            {[
              { num: '01', role: 'The Scout', title: 'Finds them', desc: 'Scours LinkedIn, Google, directories and forums to find people matching your ideal customer profile — grounded in real search results, not guesses.', radius: '16px 0 0 16px', borderRight: 'none' },
              { num: '02', role: 'The Verifier', title: 'Confirms them', desc: 'Validates that the person actually holds the role at that company today. Only real, verifiable contacts make it through to your Outreach tab.', radius: 0, bg: 'rgba(255,255,255,0.06)', borderLeft: 'none', borderRight: 'none' },
              { num: '03', role: 'The Writer', title: 'Emails them', desc: 'Crafts a personalised 4-email sequence for each verified contact using their company context. Drafts land directly in your Gmail — ready to review and send.', radius: '0 16px 16px 0', borderLeft: 'none' },
            ].map((a, i) => (
              <div key={a.num} style={{ flex: 1, padding: '36px 28px', background: a.bg || 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: a.radius, borderRight: a.borderRight, borderLeft: a.borderLeft, position: 'relative' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 48, fontWeight: 700, color: 'rgba(255,255,255,0.05)', lineHeight: 1, marginBottom: 12 }}>{a.num}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#c94670', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{a.role}</div>
                <h3 className="serif" style={{ fontSize: 22, color: '#fff', marginBottom: 10 }}>{a.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{a.desc}</p>
                {i < 2 && (
                  <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 24, height: 24, background: '#c94670', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS steps ── editorial from 1a */}
      <section style={{ padding: '88px 48px', background: '#faf9f7' }} className="px-section">
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#7a1f3d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>How it works</span>
            <h2 className="serif section-h2" style={{ fontSize: 42, color: '#1a1a1a', marginTop: 12, letterSpacing: '-0.02em' }}>Three steps to your first reply</h2>
          </div>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: 48, alignItems: 'center', marginBottom: 72 }} className="step-row">
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 72, color: '#ede9e3', lineHeight: 1, marginBottom: 8 }}>01</div>
              <h3 className="serif" style={{ fontSize: 26, color: '#1a1a1a', marginBottom: 12 }}>Describe your business</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', lineHeight: 1.65 }}>Tell us what you do, who you sell to, and what makes you different. Takes 2 minutes — like filling out a brief.</p>
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #ede9e3', borderRadius: 12, padding: 32 }}>
              {[
                { label: 'Your company', val: 'We help B2B SaaS companies build scalable GTM motions' },
                { label: 'Who you want to reach', val: 'Head of Marketing at Series A–B SaaS companies in India & USA' },
                { label: 'Your proof point', val: 'Reduced CAC by 86% for a SaaS client in 4 months' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{f.label}</div>
                  <div style={{ padding: '10px 14px', background: '#faf9f7', borderRadius: 7, border: '1px solid #ede9e3', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1a1a1a' }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Step 2 */}
          <div style={{ display: 'flex', gap: 48, alignItems: 'center', marginBottom: 72, flexDirection: 'row-reverse' }} className="step-row-rev">
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 72, color: '#ede9e3', lineHeight: 1, marginBottom: 8 }}>02</div>
              <h3 className="serif" style={{ fontSize: 26, color: '#1a1a1a', marginBottom: 12 }}>We find your prospects</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', lineHeight: 1.65 }}>Our Scout and Verifier agents search the real web, find actual decision-makers in the roles you specified, and confirm every contact is real and current.</p>
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #ede9e3', borderRadius: 12, padding: 24 }}>
              {[
                { initials: 'SR', name: 'Shantanu Roy', sub: 'VP Marketing · Chargebee · Series H', status: 'Verified', statusColor: '#2e7d32', statusBg: '#e8f5e9' },
                { initials: 'AK', name: 'Anjali Kapoor', sub: 'Head of Marketing · Freshworks · Public', status: 'Verified', statusColor: '#2e7d32', statusBg: '#e8f5e9' },
                { initials: 'VP', name: 'Vikram Patel', sub: 'CMO · Spendflo · Series A', status: 'Checking…', statusColor: '#e65100', statusBg: '#fff3e0' },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, marginBottom: 4, background: p.status === 'Verified' && p.name === 'Shantanu Roy' ? '#fdf2f5' : 'transparent' }}>
                  <div style={{ width: 32, height: 32, background: '#7a1f3d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{p.initials}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{p.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#888' }}>{p.sub}</div>
                  </div>
                  <div style={{ padding: '3px 8px', background: p.statusBg, borderRadius: 4, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: p.statusColor }}>{p.status}</div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '10px 0 4px', fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#bbb' }}>47 more prospects found…</div>
            </div>
          </div>
          {/* Step 3 */}
          <div style={{ display: 'flex', gap: 48, alignItems: 'center' }} className="step-row">
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 72, color: '#ede9e3', lineHeight: 1, marginBottom: 8 }}>03</div>
              <h3 className="serif" style={{ fontSize: 26, color: '#1a1a1a', marginBottom: 12 }}>Personalised emails go out</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', lineHeight: 1.65 }}>Each prospect gets a 4-email sequence written just for them — referencing their company, their challenges, your solution. Saved as Gmail drafts, ready for you to review and send.</p>
            </div>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #ede9e3', borderRadius: 12, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, background: '#e74c3c', borderRadius: '50%' }} />
                <div style={{ width: 8, height: 8, background: '#f39c12', borderRadius: '50%' }} />
                <div style={{ width: 8, height: 8, background: '#27ae60', borderRadius: '50%' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#bbb', marginLeft: 8 }}>Gmail — Drafts</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginBottom: 4 }}>To: shantanu.roy@chargebee.com</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginBottom: 14 }}>Subject: <span style={{ color: '#1a1a1a', fontWeight: 500 }}>Shantanu, that Gartner placement is interesting</span></div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.65 }}>
                Hi Shantanu,<br /><br />
                Chargebee landing on the Gartner Magic Quadrant two years running while consolidating the subscription tooling space — that's a smart positioning play in a crowded market.<br /><br />
                <span style={{ color: '#bbb', fontStyle: 'italic' }}>[ personalised pitch continues ]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF + STATS ── hybrid */}
      <section style={{ padding: '88px 48px', background: '#fff' }} className="px-section">
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#7a1f3d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Results</span>
            <h2 className="serif section-h2" style={{ fontSize: 42, color: '#1a1a1a', marginTop: 12, letterSpacing: '-0.02em' }}>They stopped searching. Started closing.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 48 }} className="grid-3">
            {[
              { initials: 'AD', color: '#7a1f3d', quote: '"I was spending 15 hours a week finding leads. Now I spend 15 minutes reviewing what Leads Genie found. Booked 23 calls in the first month."', name: 'Alex D.', role: 'Freelance brand strategist' },
              { initials: 'NW', color: '#b8436a', quote: '"The emails sound like me, not a robot. Clients can\'t tell the difference. Our reply rate went from 3% to 38%."', name: 'Nadia W.', role: 'Founder, Strata Digital Agency' },
              { initials: 'RM', color: '#c97d94', quote: '"Replaced a $300/mo tool stack with one sign-in. Found 200 prospects in my niche in the first week."', name: 'Ryan M.', role: 'SaaS founder' },
            ].map(t => (
              <div key={t.name} style={{ padding: 28, background: '#faf9f7', borderRadius: 12, border: '1px solid #ede9e3' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 13 }}>{s}</span>)}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: t.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{t.initials}</div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{t.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Stats bar — from 1b */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '32px 48px', background: '#1a1118', borderRadius: 14 }} className="stats-bar">
            {[
              { val: '86%', label: 'Lower CAC' },
              { val: '42%', label: 'Open rate' },
              { val: '15:1', label: 'LTV : CAC' },
              { val: '2 min', label: 'Setup time' },
            ].map((s, i) => (
              <div key={s.label} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: i > 0 ? 48 : 0 }}>
                {i > 0 && <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)', marginRight: 48 }} />}
                <div>
                  <div className="serif" style={{ fontSize: 38, color: '#c94670', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── dark from 1b */}
      <section style={{ padding: '110px 48px', background: '#1a1118', textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="px-section">
        <div style={{ position: 'absolute', bottom: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(201,70,112,0.18), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <h2 className="serif section-h2" style={{ fontSize: 52, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 18 }}>
            Your next customer is already online.<br />
            Let's go find them.
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 44 }}>
            Connect your Gmail account and send your first outreach in under 5 minutes.
          </p>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 38px', background: '#fff', borderRadius: 9, textDecoration: 'none' }}>
            {G_ICON}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Start free with Google</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 22, flexWrap: 'wrap' }}>
            {['Gmail compose-only access', 'We never read your emails', 'Cancel anytime'].map((t, i) => (
              <span key={t} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>{i > 0 ? '· ' : ''}{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px 48px', background: '#130e11', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }} className="px-section">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Leads Genie · Genie Labs</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Pricing', '/pricing']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
      </footer>
    </>
  )
}
