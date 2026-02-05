'use client'

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
          supabaseClient.from('posts').select('author_name').range(0, 999)
        ])

      const uniqueAuthors = new Set<string>()
      ;(authorsResult.data ?? []).forEach((row) => {
        const name = row.author_name?.trim()
        if (name) uniqueAuthors.add(name)
      })

      setStats((prev) => ({
        postsCount: postsResult.count ?? prev.postsCount,
        commentsCount: commentsResult.count ?? prev.commentsCount,
        bookmarksCount: bookmarksResult.count ?? prev.bookmarksCount,
        categoriesCount: categoriesResult.count ?? prev.categoriesCount,
        tagsCount: tagsResult.count ?? prev.tagsCount,
        authorsCount: uniqueAuthors.size > 0 ? uniqueAuthors.size : prev.authorsCount
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
    const tables = ['posts', 'comments', 'bookmarks', 'categories', 'tags']
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
    <section className="rounded-3xl border border-peat/10 bg-gradient-to-br from-white/95 to-slate-100 p-6 shadow-lg shadow-peat/20 dark:border-rose/40 dark:from-peat/90 dark:to-peat/70 dark:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-peat/60 dark:text-rose/200">Live stats</p>
          <h2 className="text-2xl font-semibold text-peat dark:text-white">The room at a glance</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-peat/40 dark:text-rose/200">{updatedLabel}</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-peat/20 bg-white/90 p-4 text-sm text-peat/70 shadow-inner shadow-peat/10 dark:border-peat/20 dark:bg-peat/30 dark:text-white"
          >
            <p className="text-3xl font-semibold text-peat dark:text-white">
              {metric.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-peat/50 dark:text-rose/200">{metric.label}</p>
            <p className="mt-1 text-xs text-peat/60 dark:text-rose/200">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
