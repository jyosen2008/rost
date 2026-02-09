'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import Modal from '@/components/app/modal'
import PostCreator from '@/components/post-creator'
import LiveStats from '@/components/live-stats'
import { useProfileStats } from '@/hooks/use-profile-stats'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'
import { Post } from '@/lib/db'

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
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const display = useMemo(() => {
    const handle = profile?.handle ? `@${profile.handle}` : '@rost'
    return {
      name: profile?.display_name ?? 'Röst writer',
      handle,
      bio: profile?.bio ?? ''
    }
  }, [profile])

  const fetchUserPosts = useCallback(async () => {
    if (!user?.id) {
      setMyPosts([])
      return
    }
    setLoadingPosts(true)
    const { data, error } = await supabaseClient
      .from('posts')
      .select('id, title, slug, excerpt, category, tags, published_at, created_at')
      .eq('author_id', user.id)
      .order('published_at', { ascending: false })
    setLoadingPosts(false)
    if (error) {
      console.error('Loading user posts failed', error)
      return
    }
    setMyPosts((data ?? []) as Post[])
  }, [user?.id])

  useEffect(() => {
    fetchUserPosts()
  }, [fetchUserPosts])

  useEffect(() => {
    if (!user?.id) return
    const channel = supabaseClient
      .channel(`user-posts-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `author_id=eq.${user.id}` }, () => {
        fetchUserPosts()
      })
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [fetchUserPosts, user?.id])

  const copyProfileLink = () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/profiles/${display.handle.replace('@', '')}`
    navigator.clipboard.writeText(url)
    setActionMessage('Profile link copied to clipboard.')
  }

  const sharePost = (post: Post) => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/posts/${post.slug}`
    navigator.clipboard.writeText(url)
    setActionMessage('Post link copied to clipboard.')
  }

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post? This action cannot be undone.")) {
      return
    }
    const { error } = await supabaseClient.from('posts').delete().eq('id', postId)
    if (error) {
      setActionMessage('Failed to delete post.')
      console.error('Delete post failed', error)
      return
    }
    setMyPosts((prev) => prev.filter((post) => post.id !== postId))
    setActionMessage('Post deleted.')
  }

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

        <section className="glass-panel p-6 space-y-4">
          <div className="flex flex-col gap-1 text-sm text-[var(--text-muted)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">Profile details</p>
            <p className="text-[var(--text-primary)]">Email: {user?.email ?? "Private"}</p>
            <p className="text-[var(--text-primary)]">Handle: {display.handle}</p>
            <p className="text-[var(--text-primary)]">Bio: {display.bio || "No bio yet"}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">Share link</p>
            <button
              type="button"
              onClick={copyProfileLink}
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
            >
              Copy profile link
            </button>
          </div>
          {actionMessage ? <p className="text-xs text-[var(--text-muted)]">{actionMessage}</p> : null}
        </section>

        <section className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-subtle)]">Your posts</p>
            {myPosts.length > 0 && <span className="text-xs text-[var(--text-muted)]">Auto-updates live</span>}
          </div>
          {loadingPosts ? (
            <p className="text-sm text-[var(--text-muted)]">Loading posts…</p>
          ) : myPosts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">You haven&apos;t shared anything yet.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{post.title}</h3>
                      <p className="text-[0.8rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">
                        {post.category ?? 'Uncategorized'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => sharePost(post)}
                        className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
                      >
                        Copy link
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePost(post.id)}
                        className="rounded-full border border-red-400 bg-red-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{post.excerpt ?? 'No summary provided.'}</p>
                  <p className="mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

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

        <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create a Röst post">
          <PostCreator categories={categories} tags={tags} />
        </Modal>
      </div>
    </AppShell>
  )
}
