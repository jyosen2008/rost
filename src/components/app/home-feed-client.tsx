'use client'

import { useEffect, useMemo, useState } from 'react'
import AppShell from '@/components/app/app-shell'
import SearchFilter from '@/components/search-filter'
import TagPills from '@/components/tag-pills'
import PostCard from '@/components/post-card'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { usePostInteractions } from '@/hooks/use-post-interactions'
import { useSession } from '@/hooks/use-session'
import { supabaseClient } from '@/lib/supabase-client'
import type { LiveStatsSummary, Post } from '@/lib/db'
import LiveStats from '@/components/live-stats'

const extraMoodTags = [
  'Archive',
  'Art',
  'Notes',
  'Reflection',
  'Science',
  'Letters',
  'Night',
  'Stillness'
]

type ProfileLite = {
  user_id: string
  handle: string
  display_name: string
}

export default function HomeFeedClient({
  posts,
  categories,
  tags,
  liveStats
}: {
  posts: Post[]
  categories: string[]
  tags: string[]
  liveStats: LiveStatsSummary
}) {
  const { user } = useSession()
  const { bookmarks, toggleBookmark } = useBookmarks()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const moodTags = useMemo(() => Array.from(new Set([...extraMoodTags, ...tags])), [tags])

  const postIds = useMemo(() => posts.map((p) => p.id), [posts])
  const interactions = usePostInteractions(postIds)

  const [followingIds, setFollowingIds] = useState<string[]>([])

  // Account search
  const [accountQuery, setAccountQuery] = useState('')
  const [accounts, setAccounts] = useState<ProfileLite[]>([])

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
      setFollowingIds((data ?? []).map((r) => r.following_id as string))
    }

    loadFollowing()
  }, [user?.id])

  useEffect(() => {
    const q = accountQuery.trim().replace(/^@/, '')
    if (q.length < 2) {
      setAccounts([])
      return
    }

    let active = true
    const run = async () => {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('user_id, handle, display_name')
        .or(`handle.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(8)

      if (!active) return
      if (error) {
        console.error('Account search failed', error)
        setAccounts([])
        return
      }
      setAccounts((data ?? []) as ProfileLite[])
    }

    run()
    return () => {
      active = false
    }
  }, [accountQuery])

  const filteredPosts = useMemo(() => {
    const base = posts.filter((post) => {
      const lowerTitle = post.title.toLowerCase()
      const lowerExcerpt = (post.excerpt ?? '').toLowerCase()
      const s = search.trim().toLowerCase()
      const searchMatch =
        s === '' || lowerTitle.includes(s) || lowerExcerpt.includes(s)
      if (!searchMatch) return false
      if (selectedCategory && post.category !== selectedCategory) return false
      if (selectedTags.length > 0) {
        const postTags = post.tags ?? []
        if (!selectedTags.some((tag) => postTags.includes(tag))) return false
      }
      return true
    })

    // Personalize: prioritize followed authors first
    const followingSet = new Set(followingIds)
    return [...base].sort((a, b) => {
      const aFollowed = a.author_id && followingSet.has(a.author_id) ? 1 : 0
      const bFollowed = b.author_id && followingSet.has(b.author_id) ? 1 : 0
      if (aFollowed !== bFollowed) return bFollowed - aFollowed
      const ad = new Date(a.published_at ?? a.created_at).getTime()
      const bd = new Date(b.published_at ?? b.created_at).getTime()
      return bd - ad
    })
  }, [posts, search, selectedCategory, selectedTags, followingIds])

  const toggleMoodTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="rounded-3xl border border-white/40 bg-white/70 p-5 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-peat/60">Home</p>
              <h1 className="mt-1 text-2xl font-semibold text-peat">Your feed</h1>
              <p className="mt-1 text-sm text-peat/60">Recent blogs, prioritized by who you follow and what you read.</p>
            </div>
            <div className="w-full max-w-xl">
              <input
                value={accountQuery}
                onChange={(e) => setAccountQuery(e.target.value)}
                placeholder="Search accounts (e.g. @jyotishko)"
                className="w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-peat placeholder:text-peat/50 focus:outline-none"
              />
              {accounts.length > 0 ? (
                <div className="mt-2 rounded-2xl border border-white/60 bg-white/80 p-2">
                  {accounts.map((a) => (
                    <a
                      key={a.user_id}
                      href={`/profile`}
                      className="block rounded-xl px-3 py-2 text-sm text-peat/80 hover:bg-white"
                    >
                      <span className="font-semibold">{a.display_name}</span> <span className="text-peat/50">@{a.handle}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
          <div className="space-y-4">
            <SearchFilter categories={categories} onSearch={setSearch} onCategoryChange={setSelectedCategory} />
            <TagPills tags={moodTags} selectedTags={selectedTags} onTagToggle={toggleMoodTag} onClear={() => setSelectedTags([])} />

            <div className="grid gap-6">
              {filteredPosts.length === 0 ? (
                <p className="text-peat/60">No posts match your filters yet.</p>
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

          <div className="space-y-6">
            <LiveStats
              postsCount={liveStats.totalPosts}
              commentsCount={liveStats.totalComments}
              bookmarksCount={liveStats.totalBookmarks}
              categoriesCount={categories.length}
              tagsCount={tags.length}
              authorsCount={liveStats.authorsCount}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
