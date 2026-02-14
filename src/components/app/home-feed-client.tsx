'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import PostCard from '@/components/post-card'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { usePostInteractions } from '@/hooks/use-post-interactions'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'
import type { Post } from '@/lib/db'

const normalizeHashtag = (value: string) => value.replace(/^#+/, '').trim().toLowerCase()

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
  const [displayPosts, setDisplayPosts] = useState<Post[]>(initialPosts)
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [displayTimestamp, setDisplayTimestamp] = useState<number | null>(() => {
    if (!initialPosts.length) return null
    const best = initialPosts[0]
    return new Date(best.published_at ?? best.created_at).getTime()
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [followingIds, setFollowingIds] = useState<string[]>([])

  const { bookmarks, toggleBookmark } = useBookmarks()
  const postIds = useMemo(() => displayPosts.map((p) => p.id), [displayPosts])
  const interactions = usePostInteractions(postIds)

  const getTimestamp = (post: Post | null | undefined) => {
    if (!post) return null
    return new Date(post.published_at ?? post.created_at).getTime()
  }

  const updateDisplayedPosts = useCallback((posts: Post[]) => {
    if (!posts.length) {
      setDisplayPosts([])
      setDisplayTimestamp(null)
      setPendingPosts([])
      setNewPostsCount(0)
      return
    }
    setDisplayPosts(posts)
    setDisplayTimestamp(getTimestamp(posts[0]))
    setPendingPosts([])
    setNewPostsCount(0)
  }, [])

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

    const posts = (data ?? []) as Post[]
    setLivePosts(posts)

    if (!posts.length) {
      return
    }

    const newestTimestamp = getTimestamp(posts[0])
    if (!displayTimestamp) {
      updateDisplayedPosts(posts)
      return
    }

    if (newestTimestamp && newestTimestamp > (displayTimestamp ?? 0)) {
      const newCount = posts.filter((post) => {
        const ts = getTimestamp(post)
        return ts ? ts > (displayTimestamp ?? 0) : false
      }).length
      setPendingPosts(posts)
      setNewPostsCount(newCount)
    } else {
      updateDisplayedPosts(posts)
    }
  }, [displayTimestamp, updateDisplayedPosts])

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
  }, [user?.id, setFollowingIds])

  const addHashtagFilter = () => {
    const tokens = hashtagInput
      .split(/\s+/)
      .map(normalizeHashtag)
      .filter(Boolean)
    if (!tokens.length) {
      setHashtagInput('')
      return
    }
    setSelectedHashtags((prev) => Array.from(new Set([...prev, ...tokens])))
    setHashtagInput('')
  }

  const showNewPosts = () => {
    updateDisplayedPosts(livePosts)
  }

  const preferredTags = useMemo(() => {
    const likedSet = new Set(interactions.likedPosts)
    const tagsSet = new Set<string>()
    displayPosts.forEach((post) => {
      if (!likedSet.has(post.id)) return
      ;(post.tags ?? []).forEach((tag) => tagsSet.add(tag))
    })
    return tagsSet
  }, [displayPosts, interactions.likedPosts])

  const filteredPosts = useMemo(() => {
    const base = displayPosts.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) return false
      if (selectedHashtags.length > 0) {
        const postTags = (post.tags ?? []).map((tag) => tag.toLowerCase())
        if (!selectedHashtags.some((tag) => postTags.includes(tag.toLowerCase()))) return false
      }
      return true
    })

    const followingSet = new Set(followingIds)

    const score = (post: Post) => {
      let value = 0
      if (post.author_id && followingSet.has(post.author_id)) value += 200
      if (interactions.likedPosts.includes(post.id)) value += 150
      const postTags = post.tags ?? []
      if (postTags.some((tag) => preferredTags.has(tag))) value += 60
      value += (interactions.likeCounts[post.id] ?? 0) * 3
      return value
    }

    return [...base].sort((a, b) => {
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
      const aDate = new Date(a.published_at ?? a.created_at).getTime()
      const bDate = new Date(b.published_at ?? b.created_at).getTime()
      return bDate - aDate
    })
  }, [displayPosts, selectedCategory, selectedHashtags, followingIds, interactions, preferredTags])

  const removeHashtag = (tag: string) => {
    setSelectedHashtags((prev) => prev.filter((current) => current !== tag))
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedHashtags([])
    setHashtagInput('')
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

        {newPostsCount > 0 && (
          <div className="glass-panel mx-4 flex items-center justify-between gap-4 rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-primary)] shadow-lg shadow-black/10 sm:mx-0">
            <span>{newPostsCount} new {newPostsCount === 1 ? 'post' : 'posts'} available</span>
            <button
              type="button"
              onClick={showNewPosts}
              className="rounded-full border border-[var(--card-border)] bg-[var(--accent)] px-4 py-1 text-xs text-black"
            >
              Show latest
            </button>
          </div>
        )}

        <section className="glass-panel p-5 space-y-4">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Hashtag filters</p>
              <button
                type="button"
                onClick={() => setSelectedHashtags([])}
                className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
              >
                Clear hashtags
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={hashtagInput}
                onChange={(event) => setHashtagInput(event.target.value)}
                placeholder="Type hashtags (e.g. #reflection #night)"
                className="flex-1 rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={addHashtagFilter}
                className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
              >
                Add filter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedHashtags.map((tag) => (
                <button
                  key={`hashtag-${tag}`}
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
                >
                  #{tag}
                </button>
              ))}
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
