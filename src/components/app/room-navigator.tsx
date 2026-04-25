'use client'

import type { Post } from '@/lib/db'
import { getRoomProfiles } from '@/lib/rost-features'

type RoomNavigatorProps = {
  categories: string[]
  posts: Post[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export default function RoomNavigator({ categories, posts, selectedCategory, onSelectCategory }: RoomNavigatorProps) {
  const rooms = getRoomProfiles(categories, posts)

  return (
    <section className="vibe-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">ROST rooms</p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">Pick the room energy</h2>
        </div>
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
        >
          All
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <button
            key={room.name}
            type="button"
            onClick={() => onSelectCategory(room.name)}
            className={`rounded-[22px] border p-4 text-left transition ${
              selectedCategory === room.name
                ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                : 'border-[var(--card-border)] bg-[var(--panel-bg)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{room.name}</h3>
              <span className="rounded-full border border-[var(--card-border)] px-2 py-1 text-[0.65rem] text-[var(--text-subtle)]">
                {room.postsCount}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {room.topTags.length === 0 ? (
                <span className="text-xs text-[var(--text-subtle)]">Waiting for a first signal</span>
              ) : (
                room.topTags.map((tag) => (
                  <span key={tag.name} className="rounded-full bg-[var(--surface-raised)] px-2 py-1 text-[0.7rem] text-[var(--text-muted)]">
                    #{tag.name}
                  </span>
                ))
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
