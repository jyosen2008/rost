'use client'

import { useMemo, useRef, useState } from 'react'
import AuthPanel from './auth-panel'
import BookmarkedStories from './bookmarked-stories'
import FeaturedCarousel from './featured-carousel'
import LiveStats from './live-stats'
import PostCard from './post-card'
import PostCreator from './post-creator'
import SearchFilter from './search-filter'
import StoryPromptWidget from './story-prompt-widget'
import TagPills from './tag-pills'
import ThemeToggle from './theme-toggle'
import WriterSpotlight from './writer-spotlight'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { LiveStatsSummary, Post } from '@/lib/db'

export default function HomeClient({
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
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const storyScrollRef = useRef<HTMLDivElement>(null)
  const { bookmarks, toggleBookmark } = useBookmarks()

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const lowerTitle = post.title.toLowerCase()
      const lowerExcerpt = (post.excerpt ?? '').toLowerCase()
      const searchMatch =
        search === '' ||
        lowerTitle.includes(search.toLowerCase()) ||
        lowerExcerpt.includes(search.toLowerCase())
      if (!searchMatch) return false
      if (selectedCategory && post.category !== selectedCategory) return false
      if (selectedTag && !(post.tags ?? []).includes(selectedTag)) return false
      return true
    })
  }, [posts, search, selectedCategory, selectedTag])

  const featuredPosts = useMemo(() => posts.filter((post) => post.cover_url).slice(0, 6), [posts])

  const writerStats = useMemo(() => {
    const collector = new Map<string, number>()
    posts.forEach((post) => {
      const author = post.author_name?.trim() || 'A Röst writer'
      collector.set(author, (collector.get(author) ?? 0) + 1)
    })
    return Array.from(collector.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [posts])

  const topWriter = writerStats[0] ?? null
  const otherWriters = writerStats.slice(1, 4)
  const bookmarkedPosts = useMemo(
    () => posts.filter((post) => bookmarks.includes(post.id)),
    [posts, bookmarks]
  )
  const scrollToStories = () => {
    storyScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-10">
      <header className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-peat/60">Röst</p>
          <h1 className="text-4xl font-semibold leading-tight text-peat sm:text-5xl">
            A space for every voice.
          </h1>
          <p className="text-lg text-peat/70">
            Create, share, and comment on essays, micro-stories, and journal entries with a free, open signup.
            Röst stays classy but approachable—just bring the words.
          </p>
          <div className="flex flex-wrap gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={scrollToStories}
              className="rounded-3xl border border-peat/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-peat"
            >
              Explore the story scroll
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-white/40 bg-white/80 p-6 text-sm leading-relaxed text-peat/70 shadow-lg shadow-peat/10">
          <p className="text-xl font-semibold text-peat">Röst is open for all</p>
          <p className="mt-3 text-sm">
            Sign up with email, share multiple posts, tag them with mood, category, and drop thoughts for others to comment on.
            The backend runs on Supabase (free tier) while the interface is served from Vercel/Cloudflare with a curated pastel palette.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
        <AuthPanel />
        <PostCreator categories={categories} tags={tags} />
      </div>

      <FeaturedCarousel posts={featuredPosts} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="space-y-6">
          <SearchFilter
            categories={categories}
            onSearch={setSearch}
            onCategoryChange={setSelectedCategory}
          />
          <TagPills tags={tags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />
        </div>
        <div className="space-y-6">
          <WriterSpotlight
            topWriter={topWriter}
            otherWriters={otherWriters}
            totalWriters={writerStats.length}
          />
          <StoryPromptWidget />
        </div>
      </div>

      {bookmarkedPosts.length > 0 ? (
        <BookmarkedStories posts={bookmarkedPosts} />
      ) : (
        <div className="rounded-3xl border border-peat/10 bg-white/80 p-5 text-sm text-peat/70 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-peat/60">Bookmarks</p>
          <p className="mt-2 font-semibold text-peat">Save your favorite stories to revisit them later.</p>
          <p className="text-peat/60">Tap the bookmark icon on each story card to build a personal reading list.</p>
        </div>
      )}

      <div ref={storyScrollRef} className="grid gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
        {filteredPosts.length === 0 ? (
          <p className="text-peat/60">No posts match your filters yet.</p>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isBookmarked={bookmarks.includes(post.id)}
              onBookmarkToggle={() => toggleBookmark(post.id)}
            />
          ))
        )}
      </div>

      <LiveStats
        postsCount={liveStats.totalPosts}
        commentsCount={liveStats.totalComments}
        bookmarksCount={liveStats.totalBookmarks}
        categoriesCount={categories.length}
        tagsCount={tags.length}
        authorsCount={writerStats.length}
      />
    </div>
  )
}
