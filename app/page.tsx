'use client'

import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Branch = 'Executive' | 'Congress' | 'Courts'
type Filter = 'all' | 'executive' | 'congress' | 'courts'

interface Criterion {
  label: string
  score: number
  max: number
}

interface Story {
  id: number
  branch: Branch
  date: string
  score: number
  title: string
  snapshot: string
  verdict: string
  detail: string
  criteria: Criterion[]
  sources: string[]
}

// ─────────────────────────────────────────────
// DATA — replace with your API fetch
// ─────────────────────────────────────────────
const STORIES: Story[] = [
  {
    id: 1,
    branch: 'Executive',
    date: 'Apr 10',
    score: -31,
    title: 'Sweeping tariffs imposed on 60+ trading partners without Congressional authorization',
    snapshot: 'Executive order imposes tariffs averaging 24% on imports from 63 countries. Economists project $3,800 annual increase in household costs.',
    verdict: '// VERDICT: Higher prices for consumers. Damage to export markets. Bypasses legislative process. Costs immediate. Benefits speculative.',
    detail: 'The executive order invokes the International Emergency Economic Powers Act (IEEPA) to justify tariffs without a Congressional vote. Economists at the Peterson Institute project the average American household will pay $3,800 more per year in consumer goods. The agriculture sector faces retaliatory tariffs from the EU and China affecting $28B in annual exports. No independent cost-benefit analysis was conducted prior to implementation. <strong>The action achieves a stated goal of pressuring trade partners but does so by directly taxing American consumers, bypassing the legislative branch, and triggering economic retaliation.</strong>',
    criteria: [
      { label: 'Measurable public benefit', score: -10, max: 12.5 },
      { label: 'Fiscal responsibility',     score: -8,  max: 12.5 },
      { label: 'Rule of law',               score: -8,  max: 12.5 },
      { label: 'Cost distribution',         score: -5,  max: 12.5 },
    ],
    sources: [
      'Peterson Institute Economic Analysis, Apr 2026',
      'Congressional Budget Office Impact Assessment',
      'Federal Register Vol. 91, No. 68',
      'USDA Export Impact Report Q1 2026',
    ],
  },
  {
    id: 2,
    branch: 'Congress',
    date: 'Apr 8',
    score: 22,
    title: 'Bipartisan infrastructure bill passes — $180B for bridges, tunnels, water systems',
    snapshot: 'Addresses documented backlog of 43,000 structurally deficient bridges. CBO scores it as fully offset. Projects 340,000 jobs over 5 years.',
    verdict: '// VERDICT: Addresses a real documented problem. Paid for. Creates jobs. Measurable public safety benefit.',
    detail: 'The bill targets the ASCE-documented backlog of structurally deficient infrastructure with a 10-year spending plan. The CBO independently verified that funding offsets come from eliminating identified wasteful defense procurement contracts. <strong>Unlike many infrastructure bills, this one avoids deficit spending and targets documented deficiencies rather than new projects.</strong> The 340,000 job projection is based on BLS infrastructure employment multipliers and is considered a conservative estimate by independent analysts.',
    criteria: [
      { label: 'Measurable public benefit', score: 8,  max: 12.5 },
      { label: 'Fiscal responsibility',     score: 7,  max: 12.5 },
      { label: 'Rule of law',               score: 4,  max: 12.5 },
      { label: 'Cost distribution',         score: 3,  max: 12.5 },
    ],
    sources: [
      'CBO Infrastructure Bill Scoring, Apr 2026',
      'ASCE Infrastructure Report Card 2025',
      'BLS Employment Multiplier Analysis',
      'GAO Defense Procurement Waste Report 2025',
    ],
  },
  {
    id: 3,
    branch: 'Executive',
    date: 'Apr 11',
    score: -18,
    title: 'Federal education department staff cut 62% — enforcement capacity eliminated',
    snapshot: 'Student loan processing projected to slow 8x. Civil rights enforcement caseload left unaddressed across 34 open investigations.',
    verdict: '// VERDICT: Documented harm to specific government obligations with no identified cost savings that offset service degradation.',
    detail: 'The reduction eliminates 3,200 positions primarily in student loan servicing, civil rights enforcement, and special education compliance monitoring. The Office of Inspector General found no corresponding reduction in mandated obligations. <strong>The department is legally required to process loan applications, investigate civil rights complaints, and monitor IDEA compliance — the staffing cuts do not reduce these legal obligations, only the capacity to fulfill them.</strong> Estimated cost of processing delays to borrowers: $1.2B annually.',
    criteria: [
      { label: 'Measurable public benefit', score: -7,  max: 12.5 },
      { label: 'Fiscal responsibility',     score: -4,  max: 12.5 },
      { label: 'Rule of law',               score: -5,  max: 12.5 },
      { label: 'Cost distribution',         score: -2,  max: 12.5 },
    ],
    sources: [
      'Dept of Education OIG Report, Apr 2026',
      'NCLB Compliance Monitoring Dashboard',
      'Student Loan Ombudsman Annual Report',
      'GAO IDEA Compliance Review 2025',
    ],
  },
  {
    id: 4,
    branch: 'Courts',
    date: 'Apr 9',
    score: 29,
    title: 'SCOTUS upholds state right to cap prescription insulin costs at $35/month',
    snapshot: 'Affects 8.4M insulin-dependent Americans. Average annual savings of $840. No measurable negative economic impact found in record.',
    verdict: '// VERDICT: Concrete financial relief to a large, vulnerable population. No identified harm to supply, quality, or availability.',
    detail: "The 7-2 decision affirms Colorado's insulin pricing cap as a valid exercise of state police powers under existing precedent. Amicus briefs from three independent health economics groups found no evidence that price caps at this level reduce insulin supply or manufacturer R&D investment. <strong>The policy directly reduces out-of-pocket costs for 8.4M Americans managing a life-threatening condition, with no identified tradeoffs to quality or availability in states that have implemented similar caps.</strong>",
    criteria: [
      { label: 'Measurable public benefit', score: 11, max: 12.5 },
      { label: 'Fiscal responsibility',     score: 7,  max: 12.5 },
      { label: 'Rule of law',               score: 6,  max: 12.5 },
      { label: 'Cost distribution',         score: 5,  max: 12.5 },
    ],
    sources: [
      'SCOTUS Opinion No. 24-1138',
      'Health Affairs Insulin Pricing Study 2025',
      'Colorado Dept of Health Impact Analysis',
      'JAMA Diabetes Cost Burden Report 2025',
    ],
  },
  {
    id: 5,
    branch: 'Congress',
    date: 'Apr 7',
    score: -3,
    title: 'Senate delays childcare subsidy vote 90 days — no stated rationale provided',
    snapshot: 'Delays direct relief for 2.1M families. Cost of delay estimated at $340M in workforce productivity losses. No explanation entered into record.',
    verdict: '// VERDICT: Inaction with measurable cost. Minor negative — delay is less harmful than bad policy, but still has real consequences.',
    detail: 'The procedural delay invokes Senate Rule 22 but no senator entered an official rationale into the Congressional Record. The bill had cleared committee with bipartisan support. An Urban Institute analysis estimates the 90-day delay costs working families $340M in productivity losses as parents manage childcare gaps. <strong>The score reflects that delay-by-inaction is less harmful than active bad policy, but still carries real, measurable costs to the public.</strong>',
    criteria: [
      { label: 'Measurable public benefit', score: -2,  max: 12.5 },
      { label: 'Fiscal responsibility',     score: -1,  max: 12.5 },
      { label: 'Rule of law',               score: 0,   max: 12.5 },
      { label: 'Cost distribution',         score: 0,   max: 12.5 },
    ],
    sources: [
      'Congressional Record S.2847, Apr 7 2026',
      'Urban Institute Childcare Gap Analysis',
      'Senate Procedural Rules Committee Report',
      'BLS Working Parent Labor Force Data 2025',
    ],
  },
  {
    id: 6,
    branch: 'Executive',
    date: 'Apr 6',
    score: -41,
    title: 'CDC antibiotic resistance research program frozen mid-study',
    snapshot: 'Halts 14 active multi-year studies. Antibiotic resistance kills 35,000 Americans per year. Cost savings from freeze: $180M. Long-term risk: incalculable.',
    verdict: '// VERDICT: Scores near the bottom. Saving $180M while halting research into a threat that kills 35,000/yr and could cost trillions is not common sense.',
    detail: "The freeze halts 14 studies in the CDC's Antibiotic Resistance Solutions Initiative, including three within 18 months of publishable findings on carbapenem-resistant organisms. The WHO classifies antibiotic resistance as one of the top 10 global health threats. <strong>The $180M in annual savings represents approximately 0.003% of the federal budget, while halting research the CDC's own modeling projects could prevent 200,000 deaths and $35B in healthcare costs over 10 years.</strong> Data from terminated studies cannot be recovered.",
    criteria: [
      { label: 'Measurable public benefit', score: -12, max: 12.5 },
      { label: 'Fiscal responsibility',     score: -10, max: 12.5 },
      { label: 'Rule of law',               score: -10, max: 12.5 },
      { label: 'Cost distribution',         score: -9,  max: 12.5 },
    ],
    sources: [
      'CDC ARSI Program Status Report, Apr 2026',
      'WHO Global Antimicrobial Resistance Report 2025',
      'JAMA Infectious Disease Cost Modeling 2024',
      'Office of Management and Budget Freeze Memo',
    ],
  },
  {
    id: 7,
    branch: 'Congress',
    date: 'Apr 6',
    score: 17,
    title: "VA claims backlog cleared — 400,000 veterans' pending cases resolved",
    snapshot: 'Average wait time drops from 14 months to 3 weeks. Resolves a backlog cited in OIG reports for 6 consecutive years.',
    verdict: '// VERDICT: Direct fulfillment of a core government obligation. Measurable, documented benefit to a population the government is legally obligated to serve.',
    detail: 'The resolution combines technology modernization, temporary staffing increases, and a streamlined review process for claims over 12 months old. The VA Inspector General had cited the backlog as a critical failure in six consecutive annual reports. <strong>This represents the government fulfilling a pre-existing legal obligation rather than creating a new benefit — a distinction that matters when evaluating whether government is simply doing its job.</strong> Veteran satisfaction scores in resolved cases: 87% positive.',
    criteria: [
      { label: 'Measurable public benefit', score: 6,  max: 12.5 },
      { label: 'Fiscal responsibility',     score: 4,  max: 12.5 },
      { label: 'Rule of law',               score: 4,  max: 12.5 },
      { label: 'Cost distribution',         score: 3,  max: 12.5 },
    ],
    sources: [
      'VA Office of Inspector General Annual Report 2025',
      'GAO Veterans Benefits Administration Review',
      'VA Claims Processing Dashboard Q1 2026',
      'House Veterans Affairs Committee Oversight Report',
    ],
  },
]

const TICKER_ITEMS = [
  '28 items scored this week',
  'Executive avg: −8',
  'Congress avg: +3',
  'Courts avg: +6',
  'No party labels shown',
  'Free to use. Always.',
]

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@300;400;500;700&display=swap');

  :root {
    --bg:     #EFEFEA;
    --bg-alt: #E4E4DE;
    --ink:    #111110;
    --ink-2:  #2A2A28;
    --ink-3:  #3A3A38;
    --dim:    #555550;
    --muted:  #888880;
    --border: #DDDDD8;
    --gold:   #C8B96A;
    --pos:    #1C3A1C;
    --neg:    #3A1A1A;
    --neu:    #2A2A28;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
  body { font-family: 'IBM Plex Sans', sans-serif; background: var(--bg); color: var(--ink); }
  a { color: inherit; text-decoration: none; }
  button { font-family: 'IBM Plex Mono', monospace; cursor: pointer; }

  .b-nav {
    background: var(--ink); border-bottom: 3px solid var(--ink);
    padding: 0 48px; display: flex; align-items: center;
    justify-content: space-between; height: 56px;
    position: sticky; top: 0; z-index: 100;
  }
  .b-logo { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: var(--bg); }
  .b-logo span { color: var(--gold); }
  .b-nav-links { display: flex; }
  .b-nav-links a {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted); padding: 0 18px; height: 56px; display: flex; align-items: center;
    border-left: 1px solid var(--ink-2); transition: color 0.12s, background 0.12s;
  }
  .b-nav-links a:last-child { border-right: 1px solid var(--ink-2); }
  .b-nav-links a:hover { color: var(--bg); background: var(--ink-2); }
  .b-nav-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--dim); letter-spacing: 1px; }
  .b-hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: 4px; }
  .b-hamburger span { display: block; width: 20px; height: 1.5px; background: var(--bg); }

  .b-masthead {
    background: var(--ink); padding: 48px 48px 40px; border-bottom: 3px solid var(--ink);
    display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
  }
  .b-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 20px; }
  .b-hero-title { font-family: 'IBM Plex Mono', monospace; font-size: 48px; font-weight: 700; line-height: 0.95; letter-spacing: -1px; color: var(--bg); margin-bottom: 20px; }
  .b-hero-title span { color: var(--gold); }
  .b-hero-sub { font-size: 14px; color: var(--muted); font-weight: 300; line-height: 1.65; max-width: 520px; }
  .b-hero-sub strong { color: var(--bg); font-weight: 500; }
  .b-avg-wrap { text-align: right; border-left: 1px solid var(--ink-2); padding-left: 48px; }
  .b-avg-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 8px; }
  .b-avg-num { font-family: 'IBM Plex Mono', monospace; font-size: 80px; font-weight: 700; color: var(--gold); line-height: 1; letter-spacing: -3px; }
  .b-avg-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--dim); margin-top: 6px; letter-spacing: 1px; }

  .b-ticker { background: var(--gold); border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); padding: 10px 0; overflow: hidden; white-space: nowrap; }
  .b-ticker-inner { display: inline-block; animation: b-tick 28s linear infinite; }
  @keyframes b-tick { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .b-ticker-item { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--ink); padding: 0 28px; }
  .b-ticker-sep { display: inline-block; width: 4px; height: 4px; background: var(--ink); margin-right: 28px; vertical-align: middle; }

  .b-filter-bar {
    padding: 14px 48px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2px solid var(--ink); background: var(--bg); gap: 16px; flex-wrap: wrap;
    position: sticky; top: 56px; z-index: 90;
  }
  .b-filter-group { display: flex; }
  .b-filter-btn {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 8px 16px; border: 2px solid var(--ink); background: transparent;
    color: var(--muted); margin-right: -2px; transition: all 0.1s;
  }
  .b-filter-btn:hover { background: var(--ink); color: var(--bg); }
  .b-filter-btn.active { background: var(--ink); color: var(--bg); }
  .b-sort-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 1px; }

  .b-feed { display: flex; flex-direction: column; border-bottom: 3px solid var(--ink); }

  .b-card { border-bottom: 2px solid var(--ink); background: var(--bg); transition: background 0.12s; }
  .b-card:hover:not(.b-open) { background: #E8E8E2; }
  .b-open { background: var(--ink); }

  .b-card-summary {
    padding: 28px 48px; display: grid; grid-template-columns: auto 1fr auto;
    gap: 20px; align-items: start; cursor: pointer;
  }
  .b-score-box { width: 64px; height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; border: 3px solid var(--ink); }
  .b-score-pos { background: var(--pos); border-color: var(--pos); }
  .b-score-neg { background: var(--neg); border-color: var(--neg); }
  .b-score-neu { background: var(--neu); border-color: var(--neu); }
  .b-open .b-score-box { border-color: var(--bg); }
  .b-score-n { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 700; color: var(--bg); line-height: 1; }
  .b-score-d { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: rgba(239,239,234,0.45); letter-spacing: 1px; margin-top: 2px; }

  .b-card-tags { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
  .b-branch { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 3px 9px; border: 2px solid var(--ink); }
  .b-exec { background: var(--ink); color: var(--bg); }
  .b-leg  { background: var(--ink-3); color: var(--bg); border-color: var(--ink-3); }
  .b-jud  { background: var(--muted); color: var(--bg); border-color: var(--muted); }
  .b-card-date { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--muted); letter-spacing: 1px; }
  .b-open .b-card-date { color: var(--dim); }
  .b-card-title { font-family: 'IBM Plex Sans', sans-serif; font-size: 17px; font-weight: 700; color: var(--ink); line-height: 1.3; margin-bottom: 8px; }
  .b-open .b-card-title { color: var(--bg); }
  .b-card-snap { font-size: 13px; color: var(--dim); line-height: 1.55; font-weight: 300; }
  .b-open .b-card-snap { color: var(--muted); }
  .b-card-verdict { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); margin-top: 8px; border-left: 3px solid var(--gold); padding-left: 10px; line-height: 1.4; }
  .b-open .b-card-verdict { color: var(--gold); }

  .b-expand-btn {
    flex-shrink: 0; background: none; border: none; font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
    display: flex; align-items: center; gap: 6px; padding-top: 4px; transition: color 0.12s;
  }
  .b-open .b-expand-btn { color: var(--gold); }
  .b-arrow { font-size: 12px; transition: transform 0.2s; display: inline-block; }
  .b-open .b-arrow { transform: rotate(180deg); }

  .b-detail {
    border-top: 2px solid var(--ink-2); padding: 36px 48px;
    display: grid; grid-template-columns: 1fr 280px; gap: 40px;
  }
  .b-detail-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; }
  .b-detail-body { font-size: 14px; color: var(--muted); line-height: 1.7; font-weight: 300; margin-bottom: 28px; }
  .b-detail-body strong { color: var(--bg); font-weight: 500; }

  .b-crit-list { display: flex; flex-direction: column; border: 1px solid var(--ink-2); margin-bottom: 28px; }
  .b-crit-row { display: flex; align-items: center; border-bottom: 1px solid var(--ink-2); }
  .b-crit-row:last-child { border-bottom: none; }
  .b-crit-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); padding: 12px 16px; flex: 1; border-right: 1px solid var(--ink-2); }
  .b-crit-bar-wrap { width: 120px; padding: 12px 16px; border-right: 1px solid var(--ink-2); }
  .b-crit-bar-track { height: 6px; background: var(--ink-2); }
  .b-crit-bar-fill { height: 100%; }
  .b-bar-pos { background: #4A8A4A; }
  .b-bar-neg { background: #8A3A3A; }
  .b-bar-neu { background: var(--dim); }
  .b-crit-score { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; color: var(--bg); padding: 12px 16px; width: 60px; text-align: right; }

  .b-sources { display: flex; flex-direction: column; }
  .b-source-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--ink-2); font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--dim); }
  .b-source-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

  .b-chart-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--dim); margin-bottom: 16px; text-align: center; }
  .b-chart-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .b-legend { width: 100%; display: flex; flex-direction: column; gap: 8px; }
  .b-legend-item { display: flex; align-items: center; gap: 10px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); }
  .b-legend-dot { width: 10px; height: 10px; flex-shrink: 0; }
  .b-legend-val { margin-left: auto; color: var(--bg); font-weight: 700; }

  .b-scale { background: var(--ink); padding: 32px 48px; border-bottom: 3px solid var(--ink); display: grid; grid-template-columns: auto 1fr auto; gap: 36px; align-items: center; }
  .b-scale-end { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--dim); letter-spacing: 1px; text-align: center; }
  .b-scale-n { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 700; line-height: 1; }
  .b-neg { color: #E07070; } .b-pos { color: #70C070; }
  .b-scale-track { height: 8px; background: var(--ink-2); position: relative; }
  .b-scale-zero { position: absolute; left: 50%; top: -4px; bottom: -4px; width: 2px; background: var(--dim); }
  .b-scale-avg  { position: absolute; left: 46%; top: -6px; bottom: -6px; width: 3px; background: var(--gold); }
  .b-scale-pts { display: flex; justify-content: space-between; margin-top: 8px; }
  .b-scale-pt { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--dim); letter-spacing: 1px; }
  .b-scale-note { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--gold); margin-top: 10px; letter-spacing: 1px; }

  .b-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 3px solid var(--ink); }
  .b-stat { padding: 28px 36px; border-right: 2px solid var(--ink); background: var(--bg); }
  .b-stat:nth-child(even) { background: var(--bg-alt); }
  .b-stat:last-child { border-right: none; }
  .b-stat-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .b-stat-val { font-family: 'IBM Plex Mono', monospace; font-size: 36px; font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -1px; }
  .b-stat-val span { color: var(--gold); }
  .b-stat-sub { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--muted); margin-top: 6px; letter-spacing: 1px; }

  .b-method { display: grid; grid-template-columns: 300px 1fr; border-bottom: 3px solid var(--ink); }
  .b-method-left { background: var(--ink); padding: 48px 40px; border-right: 3px solid var(--ink); }
  .b-method-title { font-family: 'IBM Plex Mono', monospace; font-size: 28px; font-weight: 700; color: var(--bg); line-height: 1.1; margin-bottom: 16px; }
  .b-method-title span { color: var(--gold); }
  .b-method-desc { font-size: 13px; color: var(--muted); font-weight: 300; line-height: 1.65; }
  .b-crit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--ink); }
  .b-crit { background: var(--bg); padding: 28px 32px; }
  .b-crit:nth-child(3), .b-crit:nth-child(4) { background: var(--bg-alt); }
  .b-crit-n { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700; color: var(--border); line-height: 1; margin-bottom: 10px; }
  .b-crit-title { font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--ink); margin-bottom: 8px; text-transform: uppercase; }
  .b-crit-body { font-size: 13px; color: var(--dim); line-height: 1.6; font-weight: 300; }

  .b-footer { background: var(--ink); }
  .b-footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; border-bottom: 1px solid var(--ink-2); }
  .b-fcol { padding: 36px 32px; border-right: 1px solid var(--ink-2); }
  .b-fcol:last-child { border-right: none; }
  .b-f-logo { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; color: var(--bg); letter-spacing: 0.5px; }
  .b-f-logo span { color: var(--gold); }
  .b-f-tag { font-size: 12px; color: var(--dim); line-height: 1.6; margin-top: 10px; font-weight: 300; }
  .b-fcol h5 { font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--ink-3); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--ink-2); }
  .b-fcol a { display: block; font-size: 12px; color: var(--muted); margin-bottom: 9px; font-weight: 300; transition: color 0.12s; }
  .b-fcol a:hover { color: var(--gold); }
  .b-footer-bottom { padding: 16px 32px; display: flex; justify-content: space-between; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: var(--ink-2); }
  .b-f-legal { display: flex; gap: 20px; }
  .b-f-legal a { color: var(--ink-2); transition: color 0.12s; }
  .b-f-legal a:hover { color: var(--muted); }

  @media (max-width: 1024px) {
    .b-hero-title { font-size: 36px; }
    .b-avg-num { font-size: 60px; }
    .b-stats { grid-template-columns: 1fr 1fr; }
    .b-stat:nth-child(2) { border-right: none; }
    .b-stat:nth-child(3) { border-top: 2px solid var(--ink); }
    .b-detail { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .b-nav { padding: 0 20px; }
    .b-nav-links { display: none; }
    .b-hamburger { display: flex; }
    .b-masthead { grid-template-columns: 1fr; padding: 32px 24px; }
    .b-avg-wrap { border-left: none; padding-left: 0; border-top: 1px solid var(--ink-2); padding-top: 20px; text-align: left; }
    .b-filter-bar { padding: 12px 20px; }
    .b-card-summary { padding: 20px; grid-template-columns: auto 1fr; }
    .b-expand-btn { display: none; }
    .b-detail { padding: 24px 20px; grid-template-columns: 1fr; }
    .b-scale { grid-template-columns: 1fr; gap: 16px; padding: 24px; }
    .b-method { grid-template-columns: 1fr; }
    .b-method-left { border-right: none; border-bottom: 3px solid var(--ink); }
    .b-crit-grid { grid-template-columns: 1fr; }
    .b-footer-top { grid-template-columns: 1fr 1fr; }
    .b-fcol:nth-child(even) { border-right: none; }
    .b-footer-bottom { flex-direction: column; gap: 10px; }
  }
`

// ─────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────
function DonutChart({ story }: { story: Story }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cx = canvas.width / 2, cy = canvas.height / 2
    const r = 80, ir = 52
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const total = story.criteria.reduce((s, c) => s + Math.abs(c.max), 0)
    let angle = -Math.PI / 2
    story.criteria.forEach(c => {
      const slice = (Math.abs(c.max) / total) * Math.PI * 2
      const intensity = Math.min(Math.abs(c.score) / Math.abs(c.max), 1)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, angle, angle + slice)
      ctx.closePath()
      ctx.fillStyle = c.score === 0 ? '#2A2A28'
        : c.score > 0 ? `rgba(74,138,74,${0.3 + intensity * 0.7})`
        : `rgba(138,58,58,${0.3 + intensity * 0.7})`
      ctx.fill()
      ctx.strokeStyle = '#111110'
      ctx.lineWidth = 2
      ctx.stroke()
      angle += slice
    })
    ctx.beginPath()
    ctx.arc(cx, cy, ir, 0, Math.PI * 2)
    ctx.fillStyle = '#111110'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold 22px 'IBM Plex Mono', monospace`
    ctx.fillStyle = story.score < -10 ? '#E07070' : story.score > 10 ? '#70C070' : '#C8B96A'
    ctx.fillText((story.score > 0 ? '+' : '') + story.score, cx, cy - 8)
    ctx.font = `9px 'IBM Plex Mono', monospace`
    ctx.fillStyle = '#555550'
    ctx.fillText('/ ±50', cx, cy + 12)
  }, [story])

  return <canvas ref={canvasRef} width={200} height={200} />
}

// ─────────────────────────────────────────────
// STORY CARD
// ─────────────────────────────────────────────
function StoryCard({ story }: { story: Story }) {
  const [open, setOpen] = useState(false)

  const scoreCls = story.score > 5 ? 'b-score-pos' : story.score < -5 ? 'b-score-neg' : 'b-score-neu'
  const branchCls = story.branch === 'Executive' ? 'b-exec' : story.branch === 'Congress' ? 'b-leg' : 'b-jud'

  return (
    <div className={`b-card${open ? ' b-open' : ''}`}>
      <div className="b-card-summary" onClick={() => setOpen(o => !o)}>
        <div className={`b-score-box ${scoreCls}`}>
          <div className="b-score-n">{story.score > 0 ? '+' : ''}{story.score}</div>
          <div className="b-score-d">/ ±50</div>
        </div>
        <div>
          <div className="b-card-tags">
            <span className={`b-branch ${branchCls}`}>{story.branch}</span>
            <span className="b-card-date">{story.date}</span>
          </div>
          <div className="b-card-title">{story.title}</div>
          <div className="b-card-snap">{story.snapshot}</div>
          <div className="b-card-verdict">{story.verdict}</div>
        </div>
        <button className="b-expand-btn" aria-label={open ? 'Collapse' : 'Expand'}>
          <span>{open ? 'Close' : 'Expand'}</span>
          <span className="b-arrow">▼</span>
        </button>
      </div>

      {open && (
        <div className="b-detail">
          <div>
            <div className="b-detail-lbl">// full_analysis</div>
            <div className="b-detail-body" dangerouslySetInnerHTML={{ __html: story.detail }} />

            <div className="b-detail-lbl">// criteria_breakdown</div>
            <div className="b-crit-list">
              {story.criteria.map(c => {
                const pct = Math.min(Math.abs(c.score / c.max) * 100, 100)
                const barCls = c.score > 0 ? 'b-bar-pos' : c.score < 0 ? 'b-bar-neg' : 'b-bar-neu'
                return (
                  <div key={c.label} className="b-crit-row">
                    <div className="b-crit-lbl">{c.label}</div>
                    <div className="b-crit-bar-wrap">
                      <div className="b-crit-bar-track">
                        <div className={`b-crit-bar-fill ${barCls}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="b-crit-score">{c.score > 0 ? '+' : ''}{c.score}</div>
                  </div>
                )
              })}
            </div>

            <div className="b-detail-lbl" style={{ marginTop: 20 }}>// sources</div>
            <div className="b-sources">
              {story.sources.map(s => (
                <div key={s} className="b-source-row">
                  <div className="b-source-dot" />{s}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="b-chart-lbl">// score_breakdown</div>
            <div className="b-chart-wrap">
              <DonutChart story={story} />
              <div className="b-legend">
                {story.criteria.map(c => (
                  <div key={c.label} className="b-legend-item">
                    <div className="b-legend-dot" style={{ background: c.score === 0 ? '#2A2A28' : c.score > 0 ? '#4A8A4A' : '#8A3A3A' }} />
                    <span>{c.label.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="b-legend-val">{c.score > 0 ? '+' : ''}{c.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function HomePage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [menuOpen, setMenuOpen] = useState(false)

  const tickerDoubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  const filtered = filter === 'all' ? STORIES : STORIES.filter(s => s.branch.toLowerCase() === filter)
  const weekAvg = Math.round(STORIES.reduce((a, s) => a + s.score, 0) / STORIES.length)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="b-nav">
        <div className="b-logo">BUREAU_OF_<span>COMMON_SENSE</span></div>
        <div className={`b-nav-links${menuOpen ? ' open' : ''}`}>
          {['All', 'Executive', 'Congress', 'Courts', 'Methodology'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
        </div>
        <div className="b-nav-tag">Free. Nonpartisan. Open.</div>
        <button className="b-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className="b-masthead">
        <div>
          <div className="b-eyebrow">// weekly_briefing — apr_12_2026</div>
          <div className="b-hero-title">NO SPIN.<br />NO SIDES.<br /><span>JUST DATA.</span></div>
          <p className="b-hero-sub">
            Every government policy, vote, and executive action scored on a single axis:{' '}
            <strong>does it make things objectively better or worse for Americans?</strong>{' '}
            Scale: −50 to +50. No party labels. No ideology. Just outcomes.{' '}
            Click any item to expand the full breakdown.
          </p>
        </div>
        <div className="b-avg-wrap">
          <div className="b-avg-label">// gov&apos;t avg this week</div>
          <div className="b-avg-num">{weekAvg > 0 ? '+' : ''}{weekAvg}</div>
          <div className="b-avg-sub">{STORIES.length} items scored</div>
        </div>
      </div>

      <div className="b-ticker">
        <div className="b-ticker-inner">
          {tickerDoubled.map((item, i) => (
            <span key={i} className="b-ticker-item">
              {item}{i < tickerDoubled.length - 1 && <span className="b-ticker-sep" />}
            </span>
          ))}
        </div>
      </div>

      <div className="b-filter-bar">
        <div className="b-filter-group">
          {(['all', 'executive', 'congress', 'courts'] as Filter[]).map(f => (
            <button key={f} className={`b-filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="b-sort-label">
          Apr 6–12 2026 &nbsp;·&nbsp; {filtered.length} item{filtered.length !== 1 ? 's' : ''} &nbsp;·&nbsp; sorted by impact
        </div>
      </div>

      <div className="b-feed" id="all">
        {filtered.map(story => <StoryCard key={story.id} story={story} />)}
      </div>

      <div className="b-scale">
        <div className="b-scale-end">
          <div className="b-scale-n b-neg">−50</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#555550', marginTop: 4, letterSpacing: 1 }}>ACTIVELY<br />HARMFUL</div>
        </div>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#555550', marginBottom: 8 }}>// scoring_scale</div>
          <div className="b-scale-track"><div className="b-scale-zero" /><div className="b-scale-avg" /></div>
          <div className="b-scale-pts">
            {['−50', '−25', '0 NEUTRAL', '+25', '+50'].map(l => (
              <span key={l} className="b-scale-pt" style={l === '0 NEUTRAL' ? { color: '#888880' } : {}}>{l}</span>
            ))}
          </div>
          <div className="b-scale-note">▲ current gov&apos;t avg: {weekAvg > 0 ? '+' : ''}{weekAvg}</div>
        </div>
        <div className="b-scale-end">
          <div className="b-scale-n b-pos">+50</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: '#555550', marginTop: 4, letterSpacing: 1 }}>CLEARLY<br />BENEFICIAL</div>
        </div>
      </div>

      <div className="b-stats">
        {[
          { lbl: '// policies_scored_ytd', val: '3', accent: ',847', sub: 'since jan 1 2026' },
          { lbl: '// avg_score_ytd',       val: '−', accent: '6.2', sub: 'net negative' },
          { lbl: '// scored_positive',     val: '38', accent: '%', sub: '1,461 of 3,847' },
          { lbl: '// highest_score',       val: '+', accent: '47', sub: 'fentanyl interdiction act' },
        ].map(s => (
          <div key={s.lbl} className="b-stat">
            <div className="b-stat-lbl">{s.lbl}</div>
            <div className="b-stat-val">{s.val}<span>{s.accent}</span></div>
            <div className="b-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="b-method" id="methodology">
        <div className="b-method-left">
          <div className="b-method-title">HOW WE<br />SCORE<br /><span>EVERYTHING.</span></div>
          <p className="b-method-desc">No left. No right. Four questions. Every policy scored the same way, every time. No exceptions for party, person, or popularity.</p>
        </div>
        <div className="b-crit-grid">
          {[
            { n: '01', title: 'Does it measurably help people?', body: 'Concrete, documented impact on health, safety, finances, or freedom. Speculation discounted. Outcomes over intentions.' },
            { n: '02', title: 'Does it cost more than it saves?', body: 'CBO scores, GAO reports, independent economic analysis. If it spends public money, we ask what it actually buys.' },
            { n: '03', title: 'Does it follow the rules?',       body: 'Actions bypassing constitutional process, established law, or democratic norms are penalized regardless of stated outcome.' },
            { n: '04', title: 'Who actually bears the cost?',    body: 'We track who benefits and who pays. Costs shifted to future generations or vulnerable populations reduce the score.' },
          ].map(c => (
            <div key={c.n} className="b-crit">
              <div className="b-crit-n">{c.n}</div>
              <div className="b-crit-title">{c.title}</div>
              <p className="b-crit-body">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="b-footer">
        <div className="b-footer-top">
          <div className="b-fcol">
            <div className="b-f-logo">BUREAU_OF_<span>COMMON_SENSE</span></div>
            <p className="b-f-tag">Free. Nonpartisan. Independent. No party funding. No ideology. Just an honest accounting of what your government is doing and whether it makes sense.</p>
          </div>
          {[
            { heading: 'Coverage', links: [['All policies', '/all'], ['Executive', '/executive'], ['Congress', '/congress'], ['Courts', '/courts'], ['States', '/states']] },
            { heading: 'About',    links: [['Methodology', '/methodology'], ['Who we are', '/about'], ['Independence', '/funding'], ['Corrections', '/corrections']] },
            { heading: 'Data',     links: [['RSS feed', '/rss'], ['Raw data', '/data'], ['API access', '/api'], ['Embed a score', '/embed']] },
          ].map(col => (
            <div key={col.heading} className="b-fcol">
              <h5>{col.heading}</h5>
              {col.links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
            </div>
          ))}
        </div>
        <div className="b-footer-bottom">
          <span>© 2026 The Bureau of Common Sense — Free to use. Unfunded by anyone with an agenda.</span>
          <div className="b-f-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
        </div>
      </footer>
    </>
  )
}
