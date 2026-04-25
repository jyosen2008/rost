'use client'

import type { Post } from '@/lib/db'
import { getTrendPulse } from '@/lib/rost-features'

type CulturePulseProps = {
  posts: Post[]
  onSelectTag: (tag: string) => void
  onSelectCategory: (category: string) => void
}

export default function CulturePulse({ posts, onSelectTag, onSelectCategory }: CulturePulseProps) {
  const pulse = getTrendPulse(posts)
  const featuredChain = pulse.chains[0]
  const featuredSeries = pulse.series[0]

  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="vibe-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">ROST pulse</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">What the room is reading</h2>
          </div>
          <span className="rounded-full border border-[var(--card-border)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Live culture map
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {pulse.tags.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Hashtags will appear as the community publishes.</p>
          ) : (
            pulse.tags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => onSelectTag(tag.name)}
                className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
              >
                #{tag.name} <span className="text-[var(--text-subtle)]">{tag.count}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <article className="vibe-panel p-5">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Chains</p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {featuredChain ? featuredChain.name.replace(/-/g, ' ') : 'Start a chain'}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {featuredChain
              ? `${featuredChain.count} posts are building this thread.`
              : 'Turn a prompt into a community-wide run of stories.'}
          </p>
        </article>

        <article className="vibe-panel p-5">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Writer rooms</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pulse.rooms.slice(0, 4).map((room) => (
              <button
                key={room.name}
                type="button"
                onClick={() => onSelectCategory(room.name)}
                className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs text-[var(--text-muted)]"
              >
                {room.name}
              </button>
            ))}
            {featuredSeries ? (
              <span className="rounded-full border border-[var(--accent)] px-3 py-1 text-xs text-[var(--accent)]">
                {featuredSeries.name.replace(/-/g, ' ')}
              </span>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  )
}
