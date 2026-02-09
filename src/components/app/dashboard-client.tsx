'use client'

import { useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import Modal from '@/components/app/modal'
import PostCreator from '@/components/post-creator'
import LiveStats from '@/components/live-stats'
import { useProfileStats } from '@/hooks/use-profile-stats'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'

export default function DashboardClient({
  categories,
  tags,
  liveStats
}: {
  categories: string[]
  tags: string[]
  liveStats: { totalPosts: number; totalComments: number; totalBookmarks: number; authorsCount: number }
}) {
  const { user } = useSession()
  const { profile, stats, followers, following } = useProfileStats(user?.id ?? null)
  const [openFollowers, setOpenFollowers] = useState(false)
  const [openFollowing, setOpenFollowing] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)

  const display = useMemo(() => {
    const handle = profile?.handle ? `@${profile.handle}` : '@rost'
    return {
      name: profile?.display_name ?? 'Rost writer',
      handle,
      bio: profile?.bio ?? ''
    }
  }, [profile])

  const signOut = async () => {
    await supabaseClient.auth.signOut()
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="glass-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{display.name}</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{display.handle}</p>
              {display.bio ? <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">{display.bio}</p> : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setOpenCreate(true)}
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Create
              </button>
              <button
                onClick={signOut}
                className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => setOpenFollowers(true)}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left"
            >
              <p className="text-3xl font-semibold text-[var(--text-primary)]">{stats.followers}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-subtle)]">Followers</p>
            </button>
            <button
              onClick={() => setOpenFollowing(true)}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left"
            >
              <p className="text-3xl font-semibold text-[var(--text-primary)]">{stats.following}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-subtle)]">Following</p>
            </button>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4">
              <p className="text-3xl font-semibold text-[var(--text-primary)]">{stats.posts}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-subtle)]">Posts</p>
            </div>
          </div>
        </header>

        <LiveStats
          postsCount={liveStats.totalPosts}
          commentsCount={liveStats.totalComments}
          bookmarksCount={liveStats.totalBookmarks}
          categoriesCount={categories.length}
          tagsCount={tags.length}
          authorsCount={liveStats.authorsCount}
        />

        <Modal open={openFollowers} onClose={() => setOpenFollowers(false)} title="Followers">
          {followers.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No followers yet.</p>
          ) : (
            <ul className="space-y-2">
              {followers.map((p) => (
                <li key={p.user_id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3">
                  <p className="font-semibold text-[var(--text-primary)]">{p.display_name}</p>
                  <p className="text-sm text-[var(--text-muted)]">@{p.handle}</p>
                </li>
              ))}
            </ul>
          )}
        </Modal>

        <Modal open={openFollowing} onClose={() => setOpenFollowing(false)} title="Following">
          {following.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Not following anyone yet.</p>
          ) : (
            <ul className="space-y-2">
              {following.map((p) => (
                <li key={p.user_id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3">
                  <p className="font-semibold text-[var(--text-primary)]">{p.display_name}</p>
                  <p className="text-sm text-[var(--text-muted)]">@{p.handle}</p>
                </li>
              ))}
            </ul>
          )}
        </Modal>

        <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create a post">
          <PostCreator categories={categories} tags={tags} />
        </Modal>
      </div>
    </AppShell>
  )
}
