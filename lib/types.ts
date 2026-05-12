export type Branch = 'Executive' | 'Congress' | 'Courts'
export type Filter = 'all' | 'executive' | 'congress' | 'courts'

export interface Criterion {
  label: string
  score: number
  max: number
}

export interface Story {
  id: number
  /** Stable upstream identifier used to dedupe across scoring runs. */
  sourceId?: string
  /** Optional canonical URL to the upstream document. */
  sourceUrl?: string
  branch: Branch
  /** Short display date, e.g. "Apr 10". */
  date: string
  /** ISO date for sorting / stats, e.g. "2026-04-10". */
  dateISO?: string
  score: number
  title: string
  snapshot: string
  verdict: string
  detail: string
  criteria: Criterion[]
  sources: string[]
}

export interface Stats {
  asOf: string
  weekLabel: string
  weekAvg: number
  weekCount: number
  ytdCount: number
  ytdAvg: number
  pctPositive: number
  ytdPositive: number
  highestScore: number
  highestTitle: string
  branchWeekAvg: Record<Branch, number>
  ticker: string[]
}
