'use client'

import Link from 'next/link'
import type { Post } from '@/lib/db'
import { createRostDigest, getStoryHeatScore } from '@/lib/rost-features'

export default function RostDigest({ posts }: { posts: Post[] }) {
  const digest = createRostDigest(posts)

  return (
    <section className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
      <div className="vibe-panel p-5">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">ROST digest</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-[var(--text-primary)]">{digest.headline}</h2>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{digest.subline}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <DigestStat label="Room" value={digest.topRoom} />
          <DigestStat label="Tag" value={`#${digest.topTag}`} />
          <DigestStat label="Prompt" value={digest.topChain} />
        </div>
      </div>

      <div className="grid gap-3">
        {digest.ranked.length === 0 ? (
          <article className="vibe-panel p-5 text-sm text-[var(--text-muted)]">
            Publish the first story and the digest will start ranking the room.
          </article>
        ) : (
          digest.ranked.map((post, index) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="vibe-panel flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">
                  Signal {index + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                  {post.excerpt ?? 'A story moving through the ROST room.'}
                </p>
              </div>
              <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                {getStoryHeatScore(post)}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function DigestStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3">
      <p className="text-[0.6rem] uppercase tracking-[0.24em] text-[var(--text-subtle)]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
