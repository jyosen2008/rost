'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import PostCard from '@/components/post-card'
import TagPills from '@/components/tag-pills'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { usePostInteractions } from '@/hooks/use-post-interactions'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'
import type { Post } from '@/lib/db'

const extraMoodTags = [
  'Archive',
  'Art',
  'Notes',
  'Reflection',
  'Science',
  'Letters',
  'Night',
  'Stillness',
  'Dreams',
  'Soundscape',
  'Quietude',
  'Memoir',
  'Travel',
  'Memory',
  'Skyline'
]

export default function HomeFeedClient({
  posts: initialPosts,
  categories,
  tags
}: {
  posts: Post[]
  categories: string[]
  tags: string[]
}) {
  const { user } = useSession()
  const [livePosts, setLivePosts] = useState<Post[]>(initialPosts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])

  const { bookmarks, toggleBookmark } = useBookmarks()
  const postIds = useMemo(() => livePosts.map((p) => p.id), [livePosts])
  const interactions = usePostInteractions(postIds)
  const moodTags = useMemo(() => Array.from(new Set([...extraMoodTags, ...tags])), [tags])

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('posts')
      .select('id, title, slug, excerpt, cover_url, category, tags, content, published_at, created_at, author_name, author_id')
      .order('published_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Live posts fetch failed', error)
      return
    }

    setLivePosts((data ?? []) as Post[])
  }, [])

  useEffect(() => {
    fetchPosts()
    const channel = supabaseClient
      .channel('home-feed-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [fetchPosts])

  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?.id) {
        setFollowingIds([])
        return
      }
      const { data, error } = await supabaseClient
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      if (error) {
        console.error('Loading following ids failed', error)
        setFollowingIds([])
        return
      }
      setFollowingIds((data ?? []).map((row) => row.following_id as string))
    }

    loadFollowing()
  }, [user?.id])

  const filteredPosts = useMemo(() => {
    const base = livePosts.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) return false
      if (selectedTags.length > 0) {
        const postTags = post.tags ?? []
        if (!selectedTags.some((tag) => postTags.includes(tag))) return false
      }
      return true
    })

    const followingSet = new Set(followingIds)
    return [...base].sort((a, b) => {
      const aFollowed = a.author_id && followingSet.has(a.author_id) ? 1 : 0
      const bFollowed = b.author_id && followingSet.has(b.author_id) ? 1 : 0
      if (aFollowed !== bFollowed) return bFollowed - aFollowed
      const aDate = new Date(a.published_at ?? a.created_at).getTime()
      const bDate = new Date(b.published_at ?? b.created_at).getTime()
      return bDate - aDate
    })
  }, [livePosts, selectedCategory, selectedTags, followingIds])

  const toggleMoodTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((current) => current !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedTags([])
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="glass-panel p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">Home</p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Your feed</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Fresh posts curated from people you follow and the topics you love. Tap the search icon in the
                sidebar to find Röst-ers or Rösts instantly.
              </p>
            </div>
          </div>
        </header>

        <section className="glass-panel p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Category</p>
              <select
                value={selectedCategory ?? ''}
                onChange={(event) => setSelectedCategory(event.target.value || null)}
                className="w-full rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm text-[var(--text-primary)]"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
            >
              Reset filters
            </button>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Mood filters</p>
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
              >
                Clear tags
              </button>
            </div>
            <div className="mt-3">
              <TagPills
                tags={moodTags}
                selectedTags={selectedTags}
                onTagToggle={toggleMoodTag}
                onClear={() => setSelectedTags([])}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6">
          {filteredPosts.length === 0 ? (
            <p className="text-[var(--text-muted)]">No posts match your filters yet.</p>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isBookmarked={bookmarks.includes(post.id)}
                onBookmarkToggle={() => toggleBookmark(post.id)}
                likeCount={interactions.likeCounts[post.id] ?? 0}
                liked={interactions.likedPosts.includes(post.id)}
                onToggleLike={() => interactions.toggleLike(post.id)}
              />
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
