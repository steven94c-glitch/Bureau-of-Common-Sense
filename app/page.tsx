'use client'

import Link from 'next/link'
import { useState } from 'react'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@300;400;500;700&display=swap');

  :root {
    --bg:       #EFEFEA;
    --bg-alt:   #E4E4DE;
    --ink:      #111110;
    --ink-mid:  #2A2A28;
    --ink-soft: #3A3A38;
    --dim:      #555550;
    --muted:    #888880;
    --border:   #DDDDD8;
    --gold:     #C8B96A;
    --pos:      #1C3A1C;
    --neg:      #3A1A1A;
    --neu:      #2A2A28;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; }
  body { font-family: 'IBM Plex Sans', sans-serif; background: var(--bg); color: var(--ink); }
  a { color: inherit; text-decoration: none; }

  /* ── Nav ── */
  .b-nav {
    background: var(--ink); border-bottom: 3px solid var(--ink);
    padding: 0 48px; display: flex; align-items: center; justify-content: space-between;
    height: 56px; position: sticky; top: 0; z-index: 100;
  }
  .b-logo { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: var(--bg); }
  .b-logo span { color: var(--gold); }
  .b-nav-links { display: flex; }
  .b-nav-links a {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 400;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
    padding: 0 18px; height: 56px; display: flex; align-items: center;
    border-left: 1px solid var(--ink-mid); transition: color 0.12s, background 0.12s;
  }
  .b-nav-links a:last-child { border-right: 1px solid var(--ink-mid); }
  .b-nav-links a:hover { color: var(--bg); background: var(--ink-mid); }
  .b-nav-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--dim); letter-spacing: 1px; }

  /* ── Masthead ── */
  .b-masthead {
    background: var(--ink); padding: 48px 48px 40px;
    border-bottom: 3px solid var(--ink);
    display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
  }
  .b-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 20px; }
  .b-hero-title { font-family: 'IBM Plex Mono', monospace; font-size: 52px; font-weight: 700; line-height: 0.95; letter-spacing: -1px; color: var(--bg); margin-bottom: 20px; }
  .b-hero-title span { color: var(--gold); }
  .b-hero-sub { font-size: 14px; color: var(--muted); font-weight: 300; line-height: 1.65; max-width: 520px; }
  .b-hero-sub strong { color: var(--bg); font-weight: 500; }
  .b-avg-wrap { text-align: right; border-left: 1px solid var(--ink-mid); padding-left: 48px; }
  .b-avg-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 8px; }
  .b-avg-num { font-family: 'IBM Plex Mono', monospace; font-size: 80px; font-weight: 700; color: var(--gold); line-height: 1; letter-spacing: -3px; }
  .b-avg-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--dim); margin-top: 6px; letter-spacing: 1px; }

  /* ── Ticker ── */
  .b-ticker { background: var(--gold); border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); padding: 10px 0; overflow: hidden; white-space: nowrap; }
  .b-ticker-inner { display: inline-block; animation: b-tick 28s linear infinite; }
  @keyframes b-tick { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .b-ticker-item { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--ink); padding: 0 28px; }
  .b-ticker-sep { display: inline-block; width: 4px; height: 4px; background: var(--ink); margin-right: 28px; vertical-align: middle; }

  /* ── Row header ── */
  .b-row-header { padding: 16px 48px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--ink); background: var(--bg); }
  .b-row-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--ink); }
  .b-row-meta { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 1px; }

  /* ── Feed ── */
  .b-feed { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 3px solid var(--ink); }
  .b-feed-main { border-right: 3px solid var(--ink); }
  .b-story { padding: 36px 40px; border-bottom: 2px solid var(--ink); }
  .b-story:last-child { border-bottom: none; }
  .b-story-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
  .b-story-tags { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .b-branch { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; border: 2px solid var(--ink); background: transparent; color: var(--ink); }
  .b-branch-exec { background: var(--ink); color: var(--bg); }
  .b-branch-leg  { background: var(--ink-soft); color: var(--bg); border-color: var(--ink-soft); }
  .b-branch-jud  { background: var(--muted); color: var(--bg); border-color: var(--muted); }
  .b-story-date { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--muted); letter-spacing: 1px; }
  .b-score-box { width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; border: 3px solid var(--ink); }
  .b-score-pos { background: var(--pos); border-color: var(--pos); }
  .b-score-neg { background: var(--neg); border-color: var(--neg); }
  .b-score-neu { background: var(--neu); border-color: var(--neu); }
  .b-score-n { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 700; color: var(--bg); line-height: 1; }
  .b-score-d { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: rgba(239,239,234,0.4); letter-spacing: 1px; margin-top: 2px; }
  .b-story-title { font-family: 'IBM Plex Sans', sans-serif; font-size: 18px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 10px; letter-spacing: -0.2px; }
  .b-story-body { font-size: 13px; color: var(--dim); line-height: 1.65; font-weight: 300; margin-bottom: 12px; }
  .b-verdict { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink); border-left: 3px solid var(--gold); padding-left: 12px; line-height: 1.5; }

  /* ── Sidebar stories ── */
  .b-feed-right { display: flex; flex-direction: column; }
  .b-story-sm { padding: 20px 28px; border-bottom: 2px solid var(--ink); display: flex; gap: 14px; align-items: flex-start; cursor: pointer; transition: background 0.1s; }
  .b-story-sm:last-child { border-bottom: none; }
  .b-story-sm:hover { background: var(--bg-alt); }
  .b-score-sm { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid var(--ink); }
  .b-score-sm-pos { background: var(--pos); border-color: var(--pos); }
  .b-score-sm-neg { background: var(--neg); border-color: var(--neg); }
  .b-score-sm-neu { background: var(--neu); border-color: var(--neu); }
  .b-score-sm-n { font-family: 'IBM Plex Mono', monospace; font-size: 14px; font-weight: 700; color: var(--bg); line-height: 1; }
  .b-sm-meta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; }
  .b-sm-title { font-family: 'IBM Plex Sans', sans-serif; font-size: 14px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 5px; }
  .b-sm-verdict { font-size: 12px; color: var(--muted); font-weight: 300; line-height: 1.4; }

  /* ── Scale band ── */
  .b-scale { background: var(--ink); padding: 32px 48px; border-bottom: 3px solid var(--ink); display: grid; grid-template-columns: auto 1fr auto; gap: 36px; align-items: center; }
  .b-scale-end { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--dim); letter-spacing: 1px; text-align: center; }
  .b-scale-end-num { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 700; line-height: 1; }
  .b-neg-num { color: #E07070; }
  .b-pos-num { color: #70C070; }
  .b-scale-track { height: 8px; background: var(--ink-mid); position: relative; }
  .b-scale-zero { position: absolute; left: 50%; top: -4px; bottom: -4px; width: 2px; background: var(--dim); }
  .b-scale-avg { position: absolute; left: 46%; top: -6px; bottom: -6px; width: 3px; background: var(--gold); }
  .b-scale-labels { display: flex; justify-content: space-between; margin-top: 8px; }
  .b-scale-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--dim); letter-spacing: 1px; }
  .b-scale-note { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--gold); margin-top: 10px; letter-spacing: 1px; }

  /* ── Stats ── */
  .b-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 3px solid var(--ink); }
  .b-stat { padding: 28px 36px; border-right: 2px solid var(--ink); background: var(--bg); }
  .b-stat:nth-child(even) { background: var(--bg-alt); }
  .b-stat:last-child { border-right: none; }
  .b-stat-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .b-stat-val { font-family: 'IBM Plex Mono', monospace; font-size: 36px; font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -1px; }
  .b-stat-val span { color: var(--gold); }
  .b-stat-sub { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--muted); margin-top: 6px; letter-spacing: 1px; }

  /* ── Methodology ── */
  .b-method { display: grid; grid-template-columns: 300px 1fr; border-bottom: 3px solid var(--ink); }
  .b-method-left { background: var(--ink); padding: 48px 40px; border-right: 3px solid var(--ink); display: flex; flex-direction: column; justify-content: space-between; }
  .b-method-title { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 700; color: var(--bg); line-height: 1.1; letter-spacing: -0.5px; margin-bottom: 16px; }
  .b-method-title span { color: var(--gold); }
  .b-method-desc { font-size: 13px; color: var(--muted); font-weight: 300; line-height: 1.65; }
  .b-crit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--ink); }
  .b-crit { background: var(--bg); padding: 28px 32px; }
  .b-crit:nth-child(3), .b-crit:nth-child(4) { background: var(--bg-alt); }
  .b-crit-n { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700; color: var(--border); line-height: 1; margin-bottom: 10px; }
  .b-crit-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--ink); margin-bottom: 8px; text-transform: uppercase; }
  .b-crit-body { font-size: 13px; color: var(--dim); line-height: 1.6; font-weight: 300; }

  /* ── Footer ── */
  .b-footer { background: var(--ink); }
  .b-footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; border-bottom: 1px solid var(--ink-mid); }
  .b-fcol { padding: 36px 32px; border-right: 1px solid var(--ink-mid); }
  .b-fcol:last-child { border-right: none; }
  .b-f-logo { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; color: var(--bg); letter-spacing: 0.5px; }
  .b-f-logo span { color: var(--gold); }
  .b-f-tag { font-size: 12px; color: var(--dim); line-height: 1.6; margin-top: 10px; font-weight: 300; }
  .b-fcol h5 { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--ink-mid); }
  .b-fcol a { display: block; font-size: 12px; color: var(--muted); margin-bottom: 9px; font-weight: 300; transition: color 0.12s; }
  .b-fcol a:hover { color: var(--gold); }
  .b-footer-bottom { padding: 16px 32px; display: flex; justify-content: space-between; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: var(--ink-mid); }
  .b-f-legal { display: flex; gap: 20px; }
  .b-f-legal a { color: var(--ink-mid); transition: color 0.12s; }
  .b-f-legal a:hover { color: var(--muted); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .b-hero-title { font-size: 40px; }
    .b-avg-num { font-size: 60px; }
    .b-stats { grid-template-columns: 1fr 1fr; }
    .b-stat:nth-child(2) { border-right: none; }
    .b-stat:nth-child(3) { border-top: 2px solid var(--ink); }
  }
  @media (max-width: 768px) {
    .b-nav { padding: 0 20px; }
    .b-nav-links { display: none; }
    .b-masthead { grid-template-columns: 1fr; padding: 36px 24px; }
    .b-avg-wrap { border-left: none; padding-left: 0; border-top: 1px solid var(--ink-mid); padding-top: 24px; text-align: left; }
    .b-hero-title { font-size: 36px; }
    .b-feed { grid-template-columns: 1fr; }
    .b-feed-main { border-right: none; border-bottom: 3px solid var(--ink); }
    .b-scale { grid-template-columns: 1fr; gap: 20px; }
    .b-method { grid-template-columns: 1fr; }
    .b-method-left { border-right: none; border-bottom: 3px solid var(--ink); }
    .b-crit-grid { grid-template-columns: 1fr; }
    .b-footer-top { grid-template-columns: 1fr 1fr; }
    .b-fcol:nth-child(even) { border-right: none; }
    .b-footer-bottom { flex-direction: column; gap: 10px; }
    .b-row-header { padding: 16px 24px; }
    .b-story { padding: 28px 24px; }
    .b-stats { grid-template-columns: 1fr 1fr; }
  }
`

const TICKER_ITEMS = [
  '28 items scored this week', 'Executive avg: −8', 'Congress avg: +3',
  'Courts avg: +6', 'No party labels shown', 'Free to use. Always.',
]

const MAIN_STORIES = [
  {
    branch: 'Executive', branchCls: 'b-branch-exec', date: 'Apr 10',
    score: '−31', scoreCls: 'b-score-neg',
    title: 'Sweeping tariffs imposed on 60+ trading partners without Congressional authorization',
    body: 'Executive order imposes tariffs averaging 24% on imports from 63 countries. Independent economists project $3,800 annual increase in household costs. No legislative authorization sought. Retaliatory measures from trading partners now affecting U.S. agriculture exports.',
    verdict: '// VERDICT: Higher prices for consumers. Damage to export markets. Bypasses legislative process. Costs are immediate and measurable. Claimed benefits speculative.',
  },
  {
    branch: 'Congress', branchCls: 'b-branch-leg', date: 'Apr 8',
    score: '+22', scoreCls: 'b-score-pos',
    title: 'Bipartisan infrastructure bill passes — $180B for bridges, tunnels, water systems',
    body: 'Addresses documented backlog of 43,000 structurally deficient bridges and aging water infrastructure across 34 states. CBO scores it as fully offset. Projects 340,000 jobs over 5 years.',
    verdict: '// VERDICT: Addresses a real, documented problem. Paid for. Creates jobs. Measurable public safety benefit.',
  },
]

const SIDE_STORIES = [
  { score: '−18', scoreCls: 'b-score-sm-neg', meta: 'Executive · Apr 11', title: 'Federal education dept. staff cut 62% — enforcement capacity eliminated', verdict: 'Student loan processing projected 8x slower. Civil rights caseload unaddressed.' },
  { score: '+29', scoreCls: 'b-score-sm-pos', meta: 'Courts · Apr 9',     title: 'SCOTUS upholds state right to cap insulin costs at $35', verdict: 'Affects 8.4M Americans. Avg savings: $840/yr. No measurable economic downside found.' },
  { score: '−3',  scoreCls: 'b-score-sm-neu', meta: 'Congress · Apr 7',   title: 'Senate delays childcare subsidy vote 90 days with no stated reason', verdict: 'Delays relief for 2.1M families. Cost of delay: ~$340M in productivity losses.' },
  { score: '+17', scoreCls: 'b-score-sm-pos', meta: 'Executive · Apr 6',   title: 'VA backlog cleared — 400,000 veterans\' claims resolved', verdict: 'Wait time drops from 14 months to 3 weeks. Direct benefit to a clear government obligation.' },
  { score: '−41', scoreCls: 'b-score-sm-neg', meta: 'Executive · Apr 6',   title: 'CDC antibiotic resistance research frozen mid-study', verdict: 'Halts 14 active studies. AMR kills 35,000 Americans/yr. No meaningful cost savings justify halt.' },
  { score: '+11', scoreCls: 'b-score-sm-pos', meta: 'Congress · Apr 6',    title: 'IRS free direct filing tool made permanent', verdict: 'Saves average filer $270/yr in tax prep fees. No cost to treasury. High adoption in pilot.' },
]

const STATS = [
  { lbl: '// policies_scored_ytd', val: '3', accent: ',847', sub: 'since jan 1 2026' },
  { lbl: '// avg_score_ytd',       val: '−', accent: '6',    sub: 'net negative'     },
  { lbl: '// scored_positive',     val: '38',accent: '%',    sub: '1,461 of 3,847'   },
  { lbl: '// highest_score',       val: '+', accent: '47',   sub: 'fentanyl interdiction act' },
]

const CRITERIA = [
  { n: '01', title: 'Does it measurably help people?', body: 'Concrete, documented impact on health, safety, finances, or freedom. Speculation is discounted. Outcomes over intentions.' },
  { n: '02', title: 'Does it cost more than it saves?', body: 'CBO scores, GAO reports, independent economic analysis. If it spends public money, we ask what it actually buys.' },
  { n: '03', title: 'Does it follow the rules?', body: 'Actions bypassing constitutional process, established law, or democratic norms are penalized — regardless of stated outcome.' },
  { n: '04', title: 'Who actually bears the cost?', body: 'We track who benefits and who pays. Costs shifted to future generations or vulnerable populations reduce the score.' },
]

const FOOTER_COLS = [
  { heading: 'Coverage', links: [['All policies', '/all'], ['Executive branch', '/executive'], ['Congress', '/congress'], ['Courts', '/courts'], ['State governments', '/states']] },
  { heading: 'About',    links: [['Methodology', '/method'], ['Who we are', '/about'], ['Independence & funding', '/funding'], ['Corrections', '/corrections']] },
  { heading: 'Data',     links: [['RSS feed', '/rss'], ['Raw data download', '/data'], ['API access', '/api'], ['Embed a score', '/embed']] },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const tickerDoubled = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Nav */}
      <nav className="b-nav">
        <div className="b-logo">BUREAU_OF_<span>COMMON_SENSE</span></div>
        <div className={`b-nav-links${menuOpen ? ' open' : ''}`}>
          <Link href="/all"       onClick={() => setMenuOpen(false)}>All</Link>
          <Link href="/executive" onClick={() => setMenuOpen(false)}>Executive</Link>
          <Link href="/congress"  onClick={() => setMenuOpen(false)}>Congress</Link>
          <Link href="/courts"    onClick={() => setMenuOpen(false)}>Courts</Link>
          <Link href="/method"    onClick={() => setMenuOpen(false)}>Methodology</Link>
        </div>
        <div className="b-nav-tag">Free. Nonpartisan. Open.</div>
      </nav>

      {/* Masthead */}
      <div className="b-masthead">
        <div>
          <div className="b-eyebrow">// weekly_briefing — apr_12_2026</div>
          <div className="b-hero-title">NO SPIN.<br />NO SIDES.<br /><span>JUST DATA.</span></div>
          <p className="b-hero-sub">
            Every government policy, vote, and executive action scored on a single axis:{' '}
            <strong>does it make things objectively better or worse for Americans?</strong>{' '}
            Scale: −50 to +50. No party labels. No ideology. Just outcomes.
          </p>
        </div>
        <div className="b-avg-wrap">
          <div className="b-avg-label">// gov't avg this week</div>
          <div className="b-avg-num">−4</div>
          <div className="b-avg-sub">28 items scored</div>
        </div>
      </div>

      {/* Ticker */}
      <div className="b-ticker">
        <div className="b-ticker-inner">
          {tickerDoubled.map((item, i) => (
            <span key={i} className="b-ticker-item">
              {item}{i < tickerDoubled.length - 1 && <span className="b-ticker-sep" />}
            </span>
          ))}
        </div>
      </div>

      {/* Row header */}
      <div className="b-row-header">
        <div className="b-row-label">// this_week</div>
        <div className="b-row-meta">Apr 6 – Apr 12, 2026 &nbsp;·&nbsp; sorted by impact</div>
      </div>

      {/* Feed */}
      <div className="b-feed">
        <div className="b-feed-main">
          {MAIN_STORIES.map(s => (
            <div key={s.title} className="b-story">
              <div className="b-story-top">
                <div className="b-story-tags">
                  <span className={`b-branch ${s.branchCls}`}>{s.branch}</span>
                  <span className="b-story-date">{s.date}</span>
                </div>
                <div className={`b-score-box ${s.scoreCls}`}>
                  <div className="b-score-n">{s.score}</div>
                  <div className="b-score-d">/ ±50</div>
                </div>
              </div>
              <div className="b-story-title">{s.title}</div>
              <p className="b-story-body">{s.body}</p>
              <div className="b-verdict">{s.verdict}</div>
            </div>
          ))}
        </div>

        <div className="b-feed-right">
          {SIDE_STORIES.map(s => (
            <div key={s.title} className="b-story-sm">
              <div className={`b-score-sm ${s.scoreCls}`}>
                <div className="b-score-sm-n">{s.score}</div>
              </div>
              <div>
                <div className="b-sm-meta">{s.meta}</div>
                <div className="b-sm-title">{s.title}</div>
                <div className="b-sm-verdict">{s.verdict}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className="b-scale">
        <div className="b-scale-end">
          <div className={`b-scale-end-num b-neg-num`}>−50</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: '#555550', marginTop: '4px', letterSpacing: '1px' }}>ACTIVELY<br />HARMFUL</div>
        </div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#555550', marginBottom: '8px' }}>// scoring_scale</div>
          <div className="b-scale-track">
            <div className="b-scale-zero" />
            <div className="b-scale-avg" />
          </div>
          <div className="b-scale-labels">
            {['−50', '−25', '0 NEUTRAL', '+25', '+50'].map(l => (
              <span key={l} className="b-scale-lbl" style={l === '0 NEUTRAL' ? { color: '#888880' } : {}}>{l}</span>
            ))}
          </div>
          <div className="b-scale-note">▲ current gov't avg: −4</div>
        </div>
        <div className="b-scale-end">
          <div className={`b-scale-end-num b-pos-num`}>+50</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: '#555550', marginTop: '4px', letterSpacing: '1px' }}>CLEARLY<br />BENEFICIAL</div>
        </div>
      </div>

      {/* Stats */}
      <div className="b-stats">
        {STATS.map(s => (
          <div key={s.lbl} className="b-stat">
            <div className="b-stat-lbl">{s.lbl}</div>
            <div className="b-stat-val">{s.val}<span>{s.accent}</span></div>
            <div className="b-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Methodology */}
      <div className="b-method">
        <div className="b-method-left">
          <div>
            <div className="b-method-title">HOW WE<br />SCORE<br /><span>EVERYTHING.</span></div>
            <p className="b-method-desc">No left. No right. Four questions. Every policy scored the same way, every time. No exceptions for party, person, or popularity.</p>
          </div>
        </div>
        <div className="b-crit-grid">
          {CRITERIA.map(c => (
            <div key={c.n} className="b-crit">
              <div className="b-crit-n">{c.n}</div>
              <div className="b-crit-title">{c.title}</div>
              <p className="b-crit-body">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="b-footer">
        <div className="b-footer-top">
          <div className="b-fcol">
            <div className="b-f-logo">BUREAU_OF_<span>COMMON_SENSE</span></div>
            <p className="b-f-tag">Free. Nonpartisan. Independent. No party funding. No ideology. Just an honest accounting of what your government is doing and whether it makes sense.</p>
          </div>
          {FOOTER_COLS.map(col => (
            <div key={col.heading} className="b-fcol">
              <h5>{col.heading}</h5>
              {col.links.map(([label, href]) => (
                <Link key={label} href={href}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="b-footer-bottom">
          <span>© 2026 The Bureau of Common Sense — Free to use. Free to share. Unfunded by anyone with an agenda.</span>
          <div className="b-f-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
