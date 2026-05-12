// ─────────────────────────────────────────────────────────────────────────────
// app/api/score/route.ts
//
// POST endpoint that lets a visitor paste a piece of writing and get an
// editorial analysis + (when applicable) the same four-criterion policy score
// we apply to real government actions.
//
// Cost / abuse protection:
//   • Per-IP limit:  5 requests per rolling 24 hours
//   • Global kill switch: hard cap of 100 requests per 24 hours across all IPs
//   • Input length cap:   12,000 chars
//
// IMPORTANT — both limits live in serverless-function memory. Each warm
// instance has its own copy; cold starts reset the counters. This is fine
// for low-traffic beta but is NOT a robust defence against a determined
// attacker. Real production hardening means moving these counters to KV
// (Vercel KV / Upstash Redis) so they're shared across instances. The TODO
// is flagged below near `ipBuckets`.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

// Always run dynamically; never cache. POST is uncached by default but we
// also touch in-memory state so we want this enforced explicitly.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ── config ───────────────────────────────────────────────────────────────────
const PER_IP_LIMIT = 5
const GLOBAL_LIMIT = 100
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_INPUT_CHARS = 12_000
const MIN_INPUT_CHARS = 80
const SCORING_MODEL = process.env.SCORING_MODEL ?? 'claude-sonnet-4-5'

// ── in-memory rate limit ─────────────────────────────────────────────────────
// TODO(scale): replace with Vercel KV / Upstash so counters survive cold starts
// and are shared across concurrent serverless instances.
type Bucket = { count: number; resetAt: number }
const ipBuckets = new Map<string, Bucket>()
let globalBucket: Bucket = { count: 0, resetAt: Date.now() + WINDOW_MS }

function getIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for; fall back to x-real-ip; last resort 'unknown'
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function checkAndConsume(ip: string): {
  ok: true
  remaining: number
} | {
  ok: false
  status: 429 | 503
  reason: string
  retryAfterSec: number
} {
  const now = Date.now()

  // Global kill switch first — protects against IP-rotation abuse.
  if (now >= globalBucket.resetAt) globalBucket = { count: 0, resetAt: now + WINDOW_MS }
  if (globalBucket.count >= GLOBAL_LIMIT) {
    return {
      ok: false,
      status: 503,
      reason: 'Daily analysis quota for the whole site is exhausted. Try again tomorrow.',
      retryAfterSec: Math.ceil((globalBucket.resetAt - now) / 1000),
    }
  }

  // Per-IP bucket
  const b = ipBuckets.get(ip)
  if (!b || now >= b.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    globalBucket.count++
    return { ok: true, remaining: PER_IP_LIMIT - 1 }
  }
  if (b.count >= PER_IP_LIMIT) {
    return {
      ok: false,
      status: 429,
      reason: `You've used all ${PER_IP_LIMIT} analyses for the next 24 hours.`,
      retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
    }
  }
  b.count++
  globalBucket.count++
  return { ok: true, remaining: PER_IP_LIMIT - b.count }
}

// Optional admin/debug endpoint — returns current bucket counts.
// Disabled in production unless explicitly enabled.
export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_RATE_LIMIT !== '1') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({
    global: { count: globalBucket.count, resetAt: globalBucket.resetAt },
    ipCount: ipBuckets.size,
    ipBuckets: Array.from(ipBuckets.entries()).map(([ip, b]) => ({ ip, ...b })),
  })
}

// ── Claude call ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an editorial analyst for the Bureau of Common Sense, a nonpartisan civic platform. A user has pasted a piece of writing — could be a news article, opinion piece, press release, social media post, or factual claim. You will return TWO independent assessments.

PART 1 — POLICY SCORE (only if applicable):
If the writing describes a concrete government action (a vote, bill, executive order, court ruling, regulation, agency action, etc.), score it on the SAME -50 to +50 scale used by the rest of the site, with the SAME four criteria. Each criterion ranges -12.5 to +12.5; the four MUST sum to the overall score.

The four criteria are:
1. "Measurable public benefit" — Concrete documented impact on health, safety, finances, or freedom. Speculation discounted.
2. "Fiscal responsibility" — Cost vs. benefit. Use any CBO/GAO/independent figures cited in the text; don't invent numbers.
3. "Rule of law" — Constitutional process, established law, democratic norms.
4. "Cost distribution" — Who pays, who benefits.

If the writing is NOT about a specific scoreable government action (e.g. it's pure opinion, a personal anecdote, off-topic, or about a non-government topic), set "scoreable": false and OMIT the policy block.

When you DO score, base it on the policy as DESCRIBED in the text. Note your uncertainty explicitly in the detail field — you are scoring based on one person's writing, not on primary source documents.

PART 2 — EDITORIAL ANALYSIS (always):
Independent of any policy score, analyze the WRITING ITSELF:
- "framing": One sentence on the headline/lede angle. Neutral language; describe what it does, not whether you agree.
- "loadedLanguage": Up to 5 specific phrases from the text that carry emotional or ideological weight (e.g. "common-sense reforms", "devastating cuts", "radical agenda"). Empty array if the writing is genuinely neutral.
- "sourcingQuality": One sentence. Are claims attributed? Are documents linked? Are opposing views represented?
- "logicalConsistency": One sentence. Do the conclusions follow from the cited evidence? Flag any non-sequiturs or statistical sleight-of-hand.
- "summary": One sentence overall read — "even-handed reporting", "heavy editorial slant", "polemic", "press release", etc.

You CANNOT verify whether the underlying facts are true. State this in "factCheckDisclaimer".

Return ONLY a JSON object with this exact shape, no prose, no fences:

{
  "scoreable": <boolean>,
  "policy": {                    // omit entirely if scoreable=false
    "score": <int -50..+50>,
    "criteria": [
      {"label":"Measurable public benefit","score":<num>,"max":12.5},
      {"label":"Fiscal responsibility","score":<num>,"max":12.5},
      {"label":"Rule of law","score":<num>,"max":12.5},
      {"label":"Cost distribution","score":<num>,"max":12.5}
    ],
    "snapshot": "<≤2 sentences, plain facts>",
    "verdict": "<sentence starting with // VERDICT:>",
    "detail": "<≤180 words; explicitly note that this is based on the submitted text, not primary sources>"
  },
  "editorial": {
    "framing": "<string>",
    "loadedLanguage": ["<phrase>", ...],
    "sourcingQuality": "<string>",
    "logicalConsistency": "<string>",
    "summary": "<string>"
  },
  "factCheckDisclaimer": "Editorial analysis only. Factual claims in the submitted text were not independently verified."
}`

type ApiSuccess = {
  scoreable: boolean
  policy?: {
    score: number
    criteria: { label: string; score: number; max: number }[]
    snapshot: string
    verdict: string
    detail: string
  }
  editorial: {
    framing: string
    loadedLanguage: string[]
    sourcingQuality: string
    logicalConsistency: string
    summary: string
  }
  factCheckDisclaimer: string
  remaining: number
}

function extractJSON(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = (fence ? fence[1] : text).trim()
  const start = raw.indexOf('{')
  if (start === -1) throw new Error('no JSON found in response')
  return JSON.parse(raw.slice(start))
}

async function callClaude(userText: string): Promise<ApiSuccess> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Server is not configured for analysis (no API key).')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: SCORING_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Upstream analysis failed (${res.status}): ${body.slice(0, 200)}`)
  }

  const json = await res.json()
  const text: string = json.content?.[0]?.text ?? ''
  const parsed = extractJSON(text) as Omit<ApiSuccess, 'remaining'>

  // Defensive normalization
  if (parsed.scoreable && parsed.policy) {
    parsed.policy.criteria = (parsed.policy.criteria || []).map(c => ({
      label: String(c.label),
      score: Number(c.score),
      max: 12.5,
    }))
    const sum = parsed.policy.criteria.reduce((a, c) => a + c.score, 0)
    parsed.policy.score = Math.max(-50, Math.min(50, Math.round(sum)))
  } else {
    delete parsed.policy
    parsed.scoreable = false
  }
  parsed.editorial = parsed.editorial || {
    framing: '', loadedLanguage: [], sourcingQuality: '', logicalConsistency: '', summary: '',
  }
  parsed.editorial.loadedLanguage = Array.isArray(parsed.editorial.loadedLanguage)
    ? parsed.editorial.loadedLanguage.map(String).slice(0, 5)
    : []

  return parsed as ApiSuccess
}

// ── handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Validate input
  let body: { text?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON: { "text": "..." }' }, { status: 400 })
  }

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (text.length < MIN_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Submission too short — paste at least ${MIN_INPUT_CHARS} characters.` },
      { status: 400 },
    )
  }
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Submission too long — max ${MAX_INPUT_CHARS} characters.` },
      { status: 413 },
    )
  }

  // 2. Rate limit
  const ip = getIp(req)
  const gate = checkAndConsume(ip)
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.reason, retryAfterSec: gate.retryAfterSec },
      { status: gate.status, headers: { 'Retry-After': String(gate.retryAfterSec) } },
    )
  }

  // 3. Call Claude
  try {
    const result = await callClaude(text)
    result.remaining = gate.remaining
    return NextResponse.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Analysis failed.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
