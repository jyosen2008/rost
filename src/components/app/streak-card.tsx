'use client'

import { useRostStreak } from '@/hooks/use-rost-streak'

export default function StreakCard() {
  const { streak } = useRostStreak()

  return (
    <section className="vibe-panel p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Streak</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-4xl font-semibold text-[var(--text-primary)]">{streak.days}</p>
          <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-subtle)]">day signal</p>
        </div>
        <div>
          <p className="text-4xl font-semibold text-[var(--text-primary)]">{streak.postsDrafted}</p>
          <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-subtle)]">draft sparks</p>
        </div>
      </div>
    </section>
  )
}
