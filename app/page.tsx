import Feed from './Feed'
import storiesData from '@/data/stories.json'
import statsData from '@/data/stats.json'
import type { Story, Stats } from '@/lib/types'

// Cast the imported JSON to our typed shapes. The JSON contracts are owned by
// scripts/score.mjs which writes these files on each scoring run.
const stories = storiesData as unknown as Story[]
const stats = statsData as unknown as Stats

export default function HomePage() {
  // Server component: data is read from disk at build time. The interactive
  // feed (filter buttons, expanding cards, donut charts) lives in <Feed/>,
  // which is a client component.
  return <Feed stories={stories} stats={stats} />
}
