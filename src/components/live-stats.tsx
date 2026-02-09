'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

type LiveStatsProps = {
  postsCount: number
  commentsCount: number
  bookmarksCount: number
  categoriesCount: number
  tagsCount: number
  authorsCount: number
}

type StatsState = {
  postsCount: number
  commentsCount: number
  bookmarksCount: number
  categoriesCount: number
  tagsCount: number
  authorsCount: number
}

export default function LiveStats({
  postsCount,
  commentsCount,
  bookmarksCount,
  categoriesCount,
  tagsCount,
  authorsCount
}: LiveStatsProps) {
  const [stats, setStats] = useState<StatsState>({
    postsCount,
    commentsCount,
    bookmarksCount,
    categoriesCount,
    tagsCount,
    authorsCount
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refreshStats = useCallback(async () => {
    try {
      const [postsResult, commentsResult, bookmarksResult, categoriesResult, tagsResult, authorsResult] =
        await Promise.all([
          supabaseClient.from('posts').select('id', { head: true, count: 'exact' }),
          supabaseClient.from('comments').select('id', { head: true, count: 'exact' }),
          supabaseClient.from('bookmarks').select('id', { head: true, count: 'exact' }),
          supabaseClient.from('categories').select('id', { head: true, count: 'exact' }),
          supabaseClient.from('tags').select('id', { head: true, count: 'exact' }),
          supabaseClient.from('profiles').select('user_id', { head: true, count: 'exact' })
        ])

      setStats((prev) => ({
        postsCount: postsResult.count ?? prev.postsCount,
        commentsCount: commentsResult.count ?? prev.commentsCount,
        bookmarksCount: bookmarksResult.count ?? prev.bookmarksCount,
        categoriesCount: categoriesResult.count ?? prev.categoriesCount,
        tagsCount: tagsResult.count ?? prev.tagsCount,
        authorsCount: authorsResult.count ?? prev.authorsCount
      }))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Updating live stats failed', error)
    }
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  useEffect(() => {
    const tables = ['posts', 'comments', 'bookmarks', 'categories', 'tags', 'profiles']
    const channels = tables.map((table) =>
      supabaseClient
        .channel(`live-stats-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          refreshStats()
        })
        .subscribe()
    )

    return () => {
      channels.forEach((channel) => {
        supabaseClient.removeChannel(channel)
      })
    }
  }, [refreshStats])

  const metrics = useMemo(
    () => [
      {
        label: 'Stories shared',
        value: stats.postsCount,
        detail: 'published and counting'
      },
      {
        label: 'Community replies',
        value: stats.commentsCount,
        detail: 'voices chimed in'
      },
      {
        label: 'Saved stories',
        value: stats.bookmarksCount,
        detail: 'tucked away'
      },
      {
        label: 'Tags cultivated',
        value: stats.tagsCount,
        detail: 'topics to explore'
      },
      {
        label: 'Categories open',
        value: stats.categoriesCount,
        detail: 'creative rooms'
      },
      {
        label: 'Active voices',
        value: stats.authorsCount,
        detail: 'writers on the scroll'
      }
    ],
    [stats]
  )

  const updatedLabel = lastUpdated
    ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Updating…'

  return (
    <section className="rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">Live stats</p>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">The room at a glance</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">{updatedLabel}</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-sm text-[var(--text-muted)] shadow-inner shadow-black/10"
          >
            <p className="text-3xl font-semibold text-[var(--text-primary)]">
              {metric.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">{metric.label}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
