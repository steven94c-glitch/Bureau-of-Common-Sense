'use client'

import { useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Analyzer
// Submission box where a visitor can paste a story and get back:
//   • our four-criterion policy score (if the writing describes a real action)
//   • an editorial analysis of the writing itself: framing, loaded language,
//     sourcing quality, logical consistency, and an overall read.
// Calls POST /api/score, which enforces a 5/IP/24h rate limit and a global
// 100/day kill switch. We surface remaining quota + Retry-After info to the user.
// ─────────────────────────────────────────────────────────────────────────────

type Criterion = { label: string; score: number; max: number }
type Result = {
  scoreable: boolean
  policy?: {
    score: number
    criteria: Criterion[]
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

const MIN_CHARS = 80
const MAX_CHARS = 12_000

const css = `
  .a-wrap {
    background: var(--bg);
    border-bottom: 3px solid var(--ink);
    padding: 56px 48px;
  }
  .a-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 1400px; margin: 0 auto; }

  .a-pitch h2 {
    font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 700;
    line-height: 1.05; letter-spacing: -1px; color: var(--ink); margin-bottom: 16px;
  }
  .a-pitch h2 span { color: var(--gold); }
  .a-pitch p { font-size: 14px; color: var(--dim); line-height: 1.65; font-weight: 300; margin-bottom: 14px; }
  .a-pitch p strong { color: var(--ink); font-weight: 500; }
  .a-pitch .a-disclaim {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px;
    color: var(--muted); border-left: 3px solid var(--gold); padding: 8px 12px;
    margin-top: 18px; line-height: 1.5;
  }

  .a-form { display: flex; flex-direction: column; }
  .a-eyebrow {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px;
    text-transform: uppercase; color: var(--dim); margin-bottom: 10px;
  }
  .a-textarea {
    width: 100%; min-height: 220px; padding: 16px;
    border: 2px solid var(--ink); background: var(--bg-alt); color: var(--ink);
    font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; line-height: 1.55;
    resize: vertical;
  }
  .a-textarea:focus { outline: none; border-color: var(--gold); background: var(--bg); }
  .a-meta {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 10px; font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; letter-spacing: 1px; color: var(--muted);
  }
  .a-meta .a-count.warn { color: #8A3A3A; }
  .a-actions { display: flex; align-items: center; gap: 14px; margin-top: 18px; flex-wrap: wrap; }
  .a-submit {
    padding: 12px 22px; border: 2px solid var(--ink); background: var(--ink); color: var(--bg);
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: opacity 0.12s;
  }
  .a-submit:hover:not(:disabled) { background: var(--gold); border-color: var(--gold); color: var(--ink); }
  .a-submit:disabled { opacity: 0.4; cursor: not-allowed; }
  .a-clear {
    padding: 12px 18px; border: 2px solid var(--ink); background: transparent; color: var(--ink);
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
  }
  .a-clear:hover { background: var(--ink); color: var(--bg); }

  .a-error {
    margin-top: 18px; padding: 14px 16px; background: var(--bg-alt);
    border: 2px solid #8A3A3A; color: #3A1A1A; font-size: 13px; line-height: 1.5;
  }
  .a-error strong { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px; }

  .a-result { margin-top: 32px; border: 2px solid var(--ink); background: var(--bg); }
  .a-result-head {
    background: var(--ink); padding: 18px 24px; display: flex; align-items: center; gap: 18px;
  }
  .a-result-score {
    width: 64px; height: 64px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; flex-shrink: 0; border: 3px solid var(--bg);
    background: var(--neu);
  }
  .a-result-score.pos { background: var(--pos); }
  .a-result-score.neg { background: var(--neg); }
  .a-result-score .n { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 700; color: var(--bg); line-height: 1; }
  .a-result-score .d { font-family: 'IBM Plex Mono', monospace; font-size: 8px; color: rgba(239,239,234,0.45); letter-spacing: 1px; margin-top: 2px; }
  .a-result-head-text { color: var(--bg); }
  .a-result-head-text .lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: var(--dim); text-transform: uppercase; }
  .a-result-head-text .val { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--bg); margin-top: 4px; }

  .a-result-section { padding: 24px; border-bottom: 1px solid var(--border); }
  .a-result-section:last-child { border-bottom: none; }
  .a-result-section h3 {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase; color: var(--dim); margin-bottom: 12px;
  }
  .a-result-section p { font-size: 14px; color: var(--ink-2); line-height: 1.65; font-weight: 300; }
  .a-result-section p + p { margin-top: 10px; }
  .a-result-section .verdict {
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink);
    border-left: 3px solid var(--gold); padding: 8px 12px; margin: 12px 0; line-height: 1.5;
  }
  .a-result-section .crit-row {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 0; border-top: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace;
  }
  .a-result-section .crit-row:first-of-type { border-top: none; }
  .a-result-section .crit-lbl { flex: 1; font-size: 10px; letter-spacing: 1px; color: var(--dim); text-transform: uppercase; }
  .a-result-section .crit-bar { width: 100px; height: 6px; background: var(--border); }
  .a-result-section .crit-fill { height: 100%; }
  .a-result-section .crit-fill.pos { background: #4A8A4A; }
  .a-result-section .crit-fill.neg { background: #8A3A3A; }
  .a-result-section .crit-n { width: 40px; text-align: right; font-size: 11px; font-weight: 700; color: var(--ink); }

  .a-loaded { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .a-loaded-pill {
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 4px 10px;
    background: var(--bg-alt); border: 1px solid var(--border); color: var(--ink-2);
  }
  .a-loaded-none { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--muted); }

  .a-disclaim-row {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: var(--muted);
    padding: 16px 24px; background: var(--bg-alt); line-height: 1.5;
  }

  @media (max-width: 1024px) {
    .a-grid { grid-template-columns: 1fr; gap: 28px; }
    .a-pitch h2 { font-size: 26px; }
  }
  @media (max-width: 768px) {
    .a-wrap { padding: 40px 20px; }
    .a-pitch h2 { font-size: 22px; }
    .a-result-section { padding: 18px 16px; }
    .a-result-head { padding: 14px 16px; gap: 14px; }
    .a-result-section .crit-bar { width: 70px; }
  }
  @media (max-width: 420px) {
    .a-wrap { padding: 32px 16px; }
    .a-textarea { padding: 12px; font-size: 13px; }
  }
`

export default function Analyzer() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const len = text.trim().length
  const tooShort = len > 0 && len < MIN_CHARS
  const tooLong = len > MAX_CHARS
  const canSubmit = !loading && len >= MIN_CHARS && len <= MAX_CHARS

  async function submit() {
    if (!canSubmit) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status}).`
        const retry = data?.retryAfterSec
          ? ` Try again in ~${Math.ceil(data.retryAfterSec / 3600)}h.`
          : ''
        setError(msg + retry)
      } else {
        setResult(data as Result)
        // Scroll the result into view on the next frame so the user sees it.
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="a-wrap" id="analyze">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="a-grid">
        <div className="a-pitch">
          <div className="a-eyebrow">// analyze_your_own</div>
          <h2>SCORE A<br /><span>STORY YOURSELF.</span></h2>
          <p>Paste a news article, opinion piece, press release, or political claim. We&apos;ll run it through the same four-criterion rubric we use here, plus an editorial read of the writing itself: framing, loaded language, sourcing, and logical consistency.</p>
          <p><strong>This is editorial analysis, not fact-checking.</strong> The model cannot verify whether the underlying claims are true. It can tell you whether the writing is biased, well-sourced, or logically consistent — but you still have to check the facts.</p>
          <div className="a-disclaim">// limit: 5 analyses per visitor per 24 hours.</div>
        </div>

        <div className="a-form">
          <div className="a-eyebrow">// paste_text_below</div>
          <textarea
            className="a-textarea"
            placeholder={`Paste a full news article, op-ed, or political statement here. Minimum ${MIN_CHARS} characters. Maximum ${MAX_CHARS.toLocaleString()}.`}
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={loading}
          />
          <div className="a-meta">
            <span className={`a-count${tooShort || tooLong ? ' warn' : ''}`}>
              {len.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
              {tooShort && ` — need ${MIN_CHARS - len} more`}
              {tooLong && ` — ${len - MAX_CHARS} over`}
            </span>
            <span>{loading ? 'Analyzing…' : 'Ready'}</span>
          </div>
          <div className="a-actions">
            <button className="a-submit" onClick={submit} disabled={!canSubmit}>
              {loading ? 'Analyzing…' : 'Score it'}
            </button>
            <button className="a-clear" onClick={() => { setText(''); setError(null); setResult(null) }} disabled={loading}>
              Clear
            </button>
          </div>

          {error && (
            <div className="a-error">
              <strong>// error</strong>
              {error}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div ref={resultRef} style={{ maxWidth: 1400, margin: '40px auto 0' }}>
          <div className="a-result">
            <div className="a-result-head">
              {result.scoreable && result.policy ? (
                <>
                  <div className={`a-result-score ${result.policy.score > 5 ? 'pos' : result.policy.score < -5 ? 'neg' : ''}`}>
                    <div className="n">{result.policy.score > 0 ? '+' : ''}{result.policy.score}</div>
                    <div className="d">/ ±50</div>
                  </div>
                  <div className="a-result-head-text">
                    <div className="lbl">// policy_score</div>
                    <div className="val">Scored on four criteria, derived from the submitted text.</div>
                  </div>
                </>
              ) : (
                <div className="a-result-head-text">
                  <div className="lbl">// not_scoreable</div>
                  <div className="val">The submission does not describe a specific government action. Editorial analysis below.</div>
                </div>
              )}
            </div>

            {result.scoreable && result.policy && (
              <>
                <div className="a-result-section">
                  <h3>// snapshot</h3>
                  <p>{result.policy.snapshot}</p>
                  <div className="verdict">{result.policy.verdict}</div>
                  <p>{result.policy.detail}</p>
                </div>
                <div className="a-result-section">
                  <h3>// criteria_breakdown</h3>
                  {result.policy.criteria.map(c => {
                    const pct = Math.min(Math.abs(c.score / c.max) * 100, 100)
                    return (
                      <div key={c.label} className="crit-row">
                        <span className="crit-lbl">{c.label}</span>
                        <div className="crit-bar">
                          <div className={`crit-fill ${c.score >= 0 ? 'pos' : 'neg'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="crit-n">{c.score > 0 ? '+' : ''}{c.score}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div className="a-result-section">
              <h3>// editorial_analysis</h3>
              <p><strong>Framing.</strong> {result.editorial.framing}</p>
              <p><strong>Sourcing quality.</strong> {result.editorial.sourcingQuality}</p>
              <p><strong>Logical consistency.</strong> {result.editorial.logicalConsistency}</p>
              <p><strong>Overall.</strong> {result.editorial.summary}</p>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 8 }}>// loaded_language_detected</h3>
                {result.editorial.loadedLanguage.length > 0 ? (
                  <div className="a-loaded">
                    {result.editorial.loadedLanguage.map((p, i) => (
                      <span key={i} className="a-loaded-pill">{p}</span>
                    ))}
                  </div>
                ) : (
                  <div className="a-loaded-none">None flagged — the writing is generally neutral.</div>
                )}
              </div>
            </div>

            <div className="a-disclaim-row">// {result.factCheckDisclaimer} · {result.remaining} analyses remaining today</div>
          </div>
        </div>
      )}
    </section>
  )
}
