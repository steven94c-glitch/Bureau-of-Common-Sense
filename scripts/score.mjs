#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/score.mjs
//
// Daily scoring pipeline for the Bureau of Common Sense.
//
//   1. Fetch candidate items from the three branches:
//        • Executive  → Federal Register (presidential documents)
//        • Congress   → api.congress.gov  (recently-acted bills)
//        • Courts     → CourtListener     (recent SCOTUS opinions)
//   2. Skip any item already present in data/stories.json (dedupe by sourceId).
//   3. Run a cheap LLM "newsworthiness" pass; drop low-signal procedural noise.
//   4. Keep up to MAX_PER_BRANCH items per branch.
//   5. Score each kept item against the four-criterion rubric via Claude.
//   6. Merge new stories into data/stories.json (newest first, capped).
//   7. Recompute data/stats.json (YTD, weekly avg, ticker, etc.).
//
// Env required:
//   ANTHROPIC_API_KEY   — for the LLM calls
//   CONGRESS_API_KEY    — for api.congress.gov (free, api.data.gov key works)
//
// Env optional:
//   MAX_PER_BRANCH      — default 10
//   SCORING_MODEL       — default "claude-sonnet-4-5"
//   STORIES_CAP         — max stories kept in stories.json (default 500)
//   LOOKBACK_DAYS       — how far back the fetchers search (default 3)
//   DRY_RUN=1           — fetch + filter + log, but skip scoring + writes
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// ── config ───────────────────────────────────────────────────────────────────
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const STORIES_PATH = path.join(ROOT, 'data', 'stories.json')
const STATS_PATH = path.join(ROOT, 'data', 'stats.json')

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY
const COURTLISTENER_TOKEN = process.env.COURTLISTENER_TOKEN
const MAX_PER_BRANCH = Number(process.env.MAX_PER_BRANCH ?? 10)
const SCORING_MODEL = process.env.SCORING_MODEL ?? 'claude-sonnet-4-5'
const STORIES_CAP = Number(process.env.STORIES_CAP ?? 500)
const LOOKBACK_DAYS = Number(process.env.LOOKBACK_DAYS ?? 3)
const DRY_RUN = process.env.DRY_RUN === '1'

if (!DRY_RUN && !ANTHROPIC_API_KEY) {
  console.error('FATAL: ANTHROPIC_API_KEY is not set.')
  process.exit(1)
}

// ── small utilities ──────────────────────────────────────────────────────────
const log = (...a) => console.log('[score]', ...a)
const warn = (...a) => console.warn('[score:warn]', ...a)

function isoDaysAgo(n) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

async function readJSON(p, fallback) {
  try { return JSON.parse(await readFile(p, 'utf8')) } catch { return fallback }
}

async function writeJSON(p, data) {
  await writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

// ── fetchers ─────────────────────────────────────────────────────────────────
// Each fetcher returns an array of "candidate" objects:
//   { sourceId, branch, dateISO, title, sourceUrl, raw }
// `raw` is the full text/abstract used for scoring; the LLM never sees a URL,
// only the document content + metadata, so we can't be tricked into following
// links.

async function fetchExecutive() {
  // https://www.federalregister.gov/developers/documentation/api/v1
  // PRESDOCU = presidential documents (EOs, proclamations, memos, determinations).
  const since = isoDaysAgo(LOOKBACK_DAYS)
  const url = new URL('https://www.federalregister.gov/api/v1/documents.json')
  url.searchParams.set('conditions[type][]', 'PRESDOCU')
  url.searchParams.set('conditions[publication_date][gte]', since)
  url.searchParams.set('per_page', '50')
  url.searchParams.set('order', 'newest')
  url.searchParams.set('fields[]', 'document_number')
  url.searchParams.set('fields[]', 'title')
  url.searchParams.set('fields[]', 'abstract')
  url.searchParams.set('fields[]', 'publication_date')
  url.searchParams.set('fields[]', 'html_url')
  url.searchParams.set('fields[]', 'presidential_document_type')
  url.searchParams.set('fields[]', 'subtype')

  log(`fetch Federal Register since ${since}`)
  const res = await fetch(url)
  if (!res.ok) { warn('Federal Register HTTP', res.status); return [] }
  const json = await res.json()
  const items = json.results ?? []
  return items
    .filter(it => it.document_number && it.publication_date)
    .map(it => {
      const title = it.title || it.subtype || it.presidential_document_type || 'Presidential document'
      return {
        sourceId: `fr:${it.document_number}`,
        branch: 'Executive',
        dateISO: it.publication_date,
        title,
        sourceUrl: it.html_url,
        raw: [
          `Type: ${it.presidential_document_type || it.subtype || 'Presidential document'}`,
          `Date: ${it.publication_date}`,
          `Title: ${title}`,
          it.abstract ? `Abstract: ${it.abstract}` : '',
        ].filter(Boolean).join('\n'),
      }
    })
}

async function fetchCongress() {
  // https://api.congress.gov/  v3 endpoints
  // We pull recently-updated bills and prefer ones with a recent "action" — passed,
  // signed, vetoed, etc. The simplest endpoint that gives us a digest is /bill.
  if (!CONGRESS_API_KEY) { warn('CONGRESS_API_KEY not set; skipping Congress'); return [] }
  const since = isoDaysAgo(LOOKBACK_DAYS) + 'T00:00:00Z'
  const url = new URL('https://api.congress.gov/v3/bill')
  url.searchParams.set('fromDateTime', since)
  url.searchParams.set('sort', 'updateDate+desc')
  url.searchParams.set('limit', '50')
  url.searchParams.set('format', 'json')
  url.searchParams.set('api_key', CONGRESS_API_KEY)

  log(`fetch Congress since ${since}`)
  const res = await fetch(url)
  if (!res.ok) { warn('Congress HTTP', res.status); return [] }
  const json = await res.json()
  const bills = json.bills ?? []
  return bills.map(b => ({
    sourceId: `cg:${b.congress}-${b.type}-${b.number}`,
    branch: 'Congress',
    dateISO: (b.updateDate || b.latestAction?.actionDate || isoDaysAgo(0)).slice(0, 10),
    title: `${b.type} ${b.number}: ${b.title}`,
    sourceUrl: b.url?.replace('api.congress.gov/v3', 'www.congress.gov'),
    raw: [
      `Bill: ${b.type} ${b.number} (Congress ${b.congress})`,
      `Title: ${b.title}`,
      b.latestAction ? `Latest action (${b.latestAction.actionDate}): ${b.latestAction.text}` : '',
      b.originChamber ? `Origin chamber: ${b.originChamber}` : '',
    ].filter(Boolean).join('\n'),
  }))
}

async function fetchCourts() {
  // https://www.courtlistener.com/help/api/rest/
  // SCOTUS court id is "scotus". opinions endpoint has date_filed.
  // CourtListener v4 requires an API token. If none is provided we skip the
  // Courts branch entirely for this run; sign up free at
  // https://www.courtlistener.com/help/api/rest/#authentication
  if (!COURTLISTENER_TOKEN) {
    warn('COURTLISTENER_TOKEN not set; skipping Courts')
    return []
  }
  const since = isoDaysAgo(LOOKBACK_DAYS)
  const url = new URL('https://www.courtlistener.com/api/rest/v4/opinions/')
  url.searchParams.set('cluster__docket__court', 'scotus')
  url.searchParams.set('date_created__gte', since)
  url.searchParams.set('order_by', '-date_created')

  log(`fetch CourtListener since ${since}`)
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'BureauOfCommonSense/1.0',
      Authorization: `Token ${COURTLISTENER_TOKEN}`,
    },
  })
  if (!res.ok) { warn('CourtListener HTTP', res.status); return [] }
  const json = await res.json()
  const results = json.results ?? []
  return results.slice(0, 20).map(o => {
    const cluster = o.cluster || {}
    const title = cluster.case_name || cluster.case_name_short || `Opinion ${o.id}`
    const dateISO = (cluster.date_filed || o.date_created || isoDaysAgo(0)).slice(0, 10)
    // plain_text can be enormous; cap to keep token cost predictable.
    const body = (o.plain_text || o.html_lawbox || '').replace(/<[^>]+>/g, ' ').slice(0, 6000)
    return {
      sourceId: `cl:${o.id}`,
      branch: 'Courts',
      dateISO,
      title,
      sourceUrl: o.absolute_url ? `https://www.courtlistener.com${o.absolute_url}` : undefined,
      raw: [
        `Case: ${title}`,
        `Filed: ${dateISO}`,
        body ? `Excerpt: ${body}` : '',
      ].filter(Boolean).join('\n'),
    }
  })
}

// ── Claude API ───────────────────────────────────────────────────────────────
async function claude({ system, user, maxTokens = 1500 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: SCORING_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Anthropic ${res.status}: ${t.slice(0, 400)}`)
  }
  const json = await res.json()
  return json.content?.[0]?.text ?? ''
}

function extractJSON(text) {
  // Tolerate fenced ```json blocks or leading prose.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = (fence ? fence[1] : text).trim()
  const start = raw.indexOf('{')
  const startA = raw.indexOf('[')
  const idx = start === -1 ? startA : startA === -1 ? start : Math.min(start, startA)
  if (idx === -1) throw new Error('no JSON found in: ' + text.slice(0, 200))
  return JSON.parse(raw.slice(idx))
}

// ── newsworthiness filter ────────────────────────────────────────────────────
// One batched call per branch. We ask Claude to return an array of {sourceId,
// keep, reason}. Anything not marked keep:true is dropped before we spend the
// real scoring budget.
async function filterNewsworthy(candidates, branchLabel) {
  if (candidates.length === 0) return []

  const system = `You are a triage editor for a nonpartisan civic platform that scores notable government actions. Your only job here is to decide which items are substantive enough to warrant a public policy score.

KEEP an item if it represents a genuine policy decision, vote, or judicial holding with measurable impact on Americans.

DROP routine procedural noise: ceremonial proclamations (e.g. national-X-month declarations), routine determinations, minor technical corrections, bill introductions with no action, and per-curiam denials of certiorari with no opinion.

Return ONLY a JSON array. No prose. Each element: {"sourceId": string, "keep": boolean, "reason": string (under 12 words)}`

  const user = `Branch: ${branchLabel}\n\nCandidates:\n\n${candidates.map((c, i) => `--- #${i + 1} ---\nsourceId: ${c.sourceId}\n${c.raw}`).join('\n\n')}`

  log(`filter ${branchLabel}: ${candidates.length} candidates`)
  const text = await claude({ system, user, maxTokens: 1500 })
  let verdicts
  try { verdicts = extractJSON(text) } catch (e) {
    warn(`filter parse failed for ${branchLabel}; keeping all. err=`, e.message)
    return candidates
  }
  const keepSet = new Set(verdicts.filter(v => v.keep).map(v => v.sourceId))
  const dropped = candidates.filter(c => !keepSet.has(c.sourceId))
  dropped.forEach(c => log(`  drop ${c.sourceId}: ${verdicts.find(v => v.sourceId === c.sourceId)?.reason || 'no reason'}`))
  return candidates.filter(c => keepSet.has(c.sourceId))
}

// ── scoring ──────────────────────────────────────────────────────────────────
const SCORING_SYSTEM = `You are the scoring engine for the Bureau of Common Sense, a nonpartisan platform that rates government actions on whether they objectively help or harm Americans.

You score one item against FOUR criteria, each on a -12.5 to +12.5 scale. The four criteria are fixed and identical for every item:

1. "Measurable public benefit" — Concrete documented impact on health, safety, finances, or freedom. Speculation discounted. Outcomes over intentions.
2. "Fiscal responsibility" — Cost vs. benefit. Use CBO/GAO/independent analysis where available. Punish unfunded liabilities.
3. "Rule of law" — Did the action follow constitutional process, established law, and democratic norms? Bypassing process is penalized regardless of stated outcome.
4. "Cost distribution" — Who pays and who benefits? Penalize costs shifted to future generations or vulnerable populations.

Total score = sum of the four criterion scores (range -50 to +50).

Style for prose fields:
- "snapshot" (≤2 sentences): plain facts, concrete numbers if known.
- "verdict" (1 sentence): MUST start with the literal text "// VERDICT:". Direct, evidence-based, no partisan adjectives.
- "detail" (1 paragraph, ≤180 words): the analysis. May include ONE <strong>...</strong> highlight on the key sentence. No other HTML.
- "sources": 2–4 short citations (e.g. "CBO Score, Apr 2026", "Federal Register Vol. 91"). Do not invent specific reports you cannot verify from the input; prefer generic citations like "Federal Register" or "Congressional Record" when uncertain.

Return ONLY a JSON object with this exact shape, no prose, no fences:

{
  "score": <int, -50..+50>,
  "snapshot": "<string>",
  "verdict": "<string starting with // VERDICT:>",
  "detail": "<string>",
  "criteria": [
    {"label":"Measurable public benefit","score":<num>,"max":12.5},
    {"label":"Fiscal responsibility","score":<num>,"max":12.5},
    {"label":"Rule of law","score":<num>,"max":12.5},
    {"label":"Cost distribution","score":<num>,"max":12.5}
  ],
  "sources": ["<string>", ...]
}

The four criterion scores MUST sum to "score".`

async function scoreOne(candidate) {
  const user = `Branch: ${candidate.branch}\nDate: ${candidate.dateISO}\n\n${candidate.raw}`
  const text = await claude({ system: SCORING_SYSTEM, user, maxTokens: 1500 })
  const obj = extractJSON(text)
  // Coerce score to int, criterion scores to numbers, and re-sum defensively.
  const criteria = (obj.criteria || []).map(c => ({
    label: String(c.label),
    score: Number(c.score),
    max: 12.5,
  }))
  const sum = criteria.reduce((a, c) => a + c.score, 0)
  const score = Math.max(-50, Math.min(50, Math.round(sum)))
  return {
    score,
    snapshot: String(obj.snapshot || '').trim(),
    verdict: String(obj.verdict || '').trim(),
    detail: String(obj.detail || '').trim(),
    criteria,
    sources: Array.isArray(obj.sources) ? obj.sources.map(String) : [],
  }
}

// ── stats recompute ──────────────────────────────────────────────────────────
function recomputeStats(stories) {
  const now = new Date()
  const asOf = now.toISOString().slice(0, 10)
  const weekStart = new Date(now); weekStart.setUTCDate(weekStart.getUTCDate() - 6)
  const weekStartISO = weekStart.toISOString().slice(0, 10)
  const weekItems = stories.filter(s => (s.dateISO || '') >= weekStartISO)

  const avg = arr => arr.length ? Math.round(arr.reduce((a, s) => a + s.score, 0) / arr.length) : 0
  const weekAvg = avg(weekItems)
  const branchWeekAvg = {
    Executive: avg(weekItems.filter(s => s.branch === 'Executive')),
    Congress: avg(weekItems.filter(s => s.branch === 'Congress')),
    Courts: avg(weekItems.filter(s => s.branch === 'Courts')),
  }
  const ytdYear = now.getUTCFullYear()
  const ytdItems = stories.filter(s => (s.dateISO || '').startsWith(String(ytdYear)))
  const ytdCount = ytdItems.length
  const ytdAvg = ytdItems.length
    ? Number((ytdItems.reduce((a, s) => a + s.score, 0) / ytdItems.length).toFixed(1))
    : 0
  const ytdPositive = ytdItems.filter(s => s.score > 0).length
  const pctPositive = ytdCount ? Math.round((ytdPositive / ytdCount) * 100) : 0
  const highest = stories.reduce((best, s) => s.score > (best?.score ?? -Infinity) ? s : best, null)

  const fmt = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n)

  const ticker = [
    `${weekItems.length} items scored this week`,
    `Executive avg: ${fmt(branchWeekAvg.Executive)}`,
    `Congress avg: ${fmt(branchWeekAvg.Congress)}`,
    `Courts avg: ${fmt(branchWeekAvg.Courts)}`,
    'No party labels shown',
    'Free to use. Always.',
  ]

  // "Apr 6–12 2026"
  const fmtMonthDay = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const weekLabel = `${fmtMonthDay(weekStart)}–${fmtMonthDay(now)} ${now.getUTCFullYear()}`

  return {
    asOf,
    weekLabel,
    weekAvg,
    weekCount: weekItems.length,
    ytdCount,
    ytdAvg,
    pctPositive,
    ytdPositive,
    highestScore: highest?.score ?? 0,
    highestTitle: highest?.title ?? '',
    branchWeekAvg,
    ticker,
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const existing = await readJSON(STORIES_PATH, [])
  const known = new Set(existing.map(s => s.sourceId).filter(Boolean))
  log(`existing stories: ${existing.length} (${known.size} with sourceId)`)

  const all = (await Promise.all([fetchExecutive(), fetchCongress(), fetchCourts()])).flat()
  log(`raw candidates: ${all.length}`)
  const fresh = all.filter(c => c.sourceId && !known.has(c.sourceId))
  log(`after dedupe: ${fresh.length}`)

  // group by branch for the newsworthiness filter
  const byBranch = { Executive: [], Congress: [], Courts: [] }
  fresh.forEach(c => byBranch[c.branch]?.push(c))

  const kept = []
  for (const branch of ['Executive', 'Congress', 'Courts']) {
    if (byBranch[branch].length === 0) continue
    let filtered
    if (DRY_RUN) {
      // DRY_RUN skips the LLM filter so we can validate fetchers without
      // burning API credits. Slice to the cap so the log mirrors a real run.
      filtered = byBranch[branch]
    } else {
      try {
        filtered = await filterNewsworthy(byBranch[branch], branch)
      } catch (e) {
        warn(`filter failed for ${branch}; keeping all. err=`, e.message)
        filtered = byBranch[branch]
      }
    }
    kept.push(...filtered.slice(0, MAX_PER_BRANCH))
  }
  log(`after filter & cap: ${kept.length} to score`)

  if (DRY_RUN) {
    log('DRY_RUN — would score:')
    kept.forEach(c => {
      const title = String(c.title ?? '(no title)').slice(0, 80)
      log(`  ${c.branch} ${c.dateISO} ${c.sourceId} — ${title}`)
    })
    return
  }

  const scored = []
  let nextId = Math.max(0, ...existing.map(s => Number(s.id) || 0)) + 1
  for (const cand of kept) {
    try {
      const result = await scoreOne(cand)
      scored.push({
        id: nextId++,
        sourceId: cand.sourceId,
        sourceUrl: cand.sourceUrl,
        branch: cand.branch,
        date: shortDate(cand.dateISO),
        dateISO: cand.dateISO,
        title: cand.title,
        ...result,
      })
      log(`  scored ${cand.sourceId} → ${result.score}`)
    } catch (e) {
      warn(`scoring failed for ${cand.sourceId}:`, e.message)
    }
  }

  if (scored.length === 0) {
    log('nothing new to add; exiting without writes')
    return
  }

  const merged = [...scored, ...existing]
    .sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''))
    .slice(0, STORIES_CAP)

  const stats = recomputeStats(merged)

  await writeJSON(STORIES_PATH, merged)
  await writeJSON(STATS_PATH, stats)
  log(`wrote ${merged.length} stories, stats.weekAvg=${stats.weekAvg}`)
}

main().catch(e => { console.error(e); process.exit(1) })
