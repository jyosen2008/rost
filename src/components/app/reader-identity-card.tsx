'use client'

import type { Post } from '@/lib/db'
import { getReaderTaste } from '@/lib/rost-features'

export default function ReaderIdentityCard({ posts }: { posts: Post[] }) {
  const taste = getReaderTaste(posts)

  return (
    <section className="vibe-panel p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Reader identity</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{taste.title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <TastePill label="Room" value={taste.favoriteRoom} />
        <TastePill label="Tag" value={`#${taste.favoriteTag}`} />
        <TastePill label="Series" value={taste.favoriteSeries} />
      </div>
    </section>
  )
}

function TastePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3">
      <p className="text-[0.6rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
