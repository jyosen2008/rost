'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import CulturePulse from '@/components/app/culture-pulse'
import RoomNavigator from '@/components/app/room-navigator'
import RostDigest from '@/components/app/rost-digest'
import StreakCard from '@/components/app/streak-card'
import PostCard from '@/components/post-card'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { usePostInteractions } from '@/hooks/use-post-interactions'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'
import { getPostFeatureMeta } from '@/lib/rost-features'
import type { Post } from '@/lib/db'

const normalizeHashtag = (value: string) => value.replace(/^#+/, '').trim().toLowerCase()

const formatFilters = [
  { value: '', label: 'All formats' },
  { value: 'quick-note', label: 'Quick notes' },
  { value: 'quote-react', label: 'Quote reacts' },
  { value: 'response-essay', label: 'Duet essays' },
  { value: 'drop', label: 'Live drops' },
  { value: 'anonymous-verified', label: 'Anon verified' }
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
  const [displayPosts, setDisplayPosts] = useState<Post[]>(initialPosts)
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [displayTimestamp, setDisplayTimestamp] = useState<number | null>(() => {
    if (!initialPosts.length) return null
    const best = initialPosts[0]
    return new Date(best.published_at ?? best.created_at).getTime()
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const deferredSearchQuery = useDeferredValue(searchQuery)

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

  const addSingleHashtagFilter = (tag: string) => {
    const normalized = normalizeHashtag(tag)
    if (!normalized) return
    setSelectedHashtags((prev) => Array.from(new Set([...prev, normalized])))
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
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase()
    const base = displayPosts.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) return false
      if (selectedFormat) {
        const meta = getPostFeatureMeta(post)
        const postTags = (post.tags ?? []).map((tag) => tag.toLowerCase())
        const matchesFormat =
          (selectedFormat === 'quick-note' && meta.isQuickNote) ||
          (selectedFormat === 'quote-react' && meta.isQuoteReact) ||
          (selectedFormat === 'response-essay' && meta.isResponseEssay) ||
          (selectedFormat === 'drop' && meta.isDrop) ||
          (selectedFormat === 'anonymous-verified' && meta.isAnonymous) ||
          postTags.includes(selectedFormat)
        if (!matchesFormat) return false
      }
      if (normalizedSearch) {
        const haystack = [
          post.title,
          post.excerpt ?? '',
          post.category ?? '',
          post.author_name ?? '',
          ...(post.tags ?? [])
        ].join(' ').toLowerCase()
        if (!haystack.includes(normalizedSearch)) return false
      }
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
  }, [displayPosts, deferredSearchQuery, selectedCategory, selectedFormat, selectedHashtags, followingIds, interactions, preferredTags])

  const removeHashtag = (tag: string) => {
    setSelectedHashtags((prev) => prev.filter((current) => current !== tag))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedFormat('')
    setSelectedHashtags([])
    setHashtagInput('')
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="desk-card overflow-hidden p-0">
          <div className="grid gap-4 p-5 lg:grid-cols-[1fr,280px] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">Live desk</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-[var(--text-primary)]">
                Read the room without needing a manual.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
                Fresh posts, anonymous drops, duet essays, live drops, and culture signals are grouped into simple rooms and formats.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">Showing now</p>
              <p className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">{filteredPosts.length}</p>
              <p className="text-sm text-[var(--text-muted)]">posts matched to your current lens</p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1fr,260px]">
          <RostDigest posts={displayPosts} />
          <StreakCard />
        </div>

        <CulturePulse
          posts={displayPosts}
          onSelectTag={addSingleHashtagFilter}
          onSelectCategory={setSelectedCategory}
        />

        <RoomNavigator
          categories={categories}
          posts={displayPosts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

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

        <section className="desk-card space-y-5 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Explore</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">Find your room, format, or signal</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Search first, then narrow by room, format, and tags. No decoding required.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="action-pill px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
            >
              Reset filters
            </button>
          </div>

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, writer, room, or tag"
            className="field-control px-4 py-3 text-sm"
          />

          <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Rooms</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="feature-chip px-3 py-2 text-xs font-semibold"
                  data-active={!selectedCategory}
                >
                  All rooms
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="feature-chip px-3 py-2 text-xs font-semibold"
                    data-active={selectedCategory === category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Formats</p>
              <div className="flex flex-wrap gap-2">
                {formatFilters.map((item) => (
                  <button
                    key={item.value || 'all-formats'}
                    type="button"
                    onClick={() => setSelectedFormat(item.value)}
                    className="feature-chip px-3 py-2 text-xs font-semibold"
                    data-active={selectedFormat === item.value}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Tags</p>
              <button
                type="button"
                onClick={() => setSelectedHashtags([])}
                className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
              >
                Clear tags
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={hashtagInput}
                onChange={(event) => setHashtagInput(event.target.value)}
                placeholder="Type tags, like #reflection #night"
                className="field-control flex-1 px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addHashtagFilter}
                className="action-pill px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
              >
                Add tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedHashtags.map((tag) => (
                <button
                  key={`hashtag-${tag}`}
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="feature-chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"
                >
                  #{tag} x
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
