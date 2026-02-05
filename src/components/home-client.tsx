'use client'

import { useMemo, useRef, useState } from 'react'
import AuthPanel from './auth-panel'
import PostCard from './post-card'
import PostCreator from './post-creator'
import SearchFilter from './search-filter'
import ThemeToggle from './theme-toggle'
import { Post } from '@/lib/db'

export default function HomeClient({
  posts,
  categories,
  tags
}: {
  posts: Post[]
  categories: string[]
  tags: string[]
}) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const storyScrollRef = useRef<HTMLDivElement>(null)

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        search === '' ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false
      if (selectedCategory && post.category !== selectedCategory) return false
      if (selectedTag && !(post.tags ?? []).includes(selectedTag)) return false
      return true
    })
  }, [posts, search, selectedCategory, selectedTag])

  const handleExploreStoryScroll = () => {
    storyScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-10">
      <header className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-peat/60">Röst</p>
          <h1 className="text-4xl font-semibold leading-tight text-peat sm:text-5xl">
            A pastel-hued storytelling space for every voice.
          </h1>
          <p className="text-lg text-peat/70">
            Create, share, and comment on essays, micro-stories, and journal entries with a free, open
            signup. Röst stays classy but approachable—just bring the words.
          </p>
          <div className="flex flex-wrap gap-3">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-3xl border border-peat/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-peat"
              onClick={handleExploreStoryScroll}
            >
              Explore the story scroll
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-white/40 bg-white/80 p-6 text-sm leading-relaxed text-peat/70 shadow-lg shadow-peat/10">
          <p className="text-xl font-semibold text-peat">Röst is open for all</p>
          <p className="mt-3 text-sm">
            Sign up with email, share multiple posts, tag them with mood, category, and drop thinks for
            others to comment on. The backend runs on Supabase (free tier) while the interface is served
            from Vercel/Cloudflare with a curated pastel palette.
          </p>
        </div>
      </header>

      <SearchFilter
        categories={categories}
        tags={tags}
        onSearch={setSearch}
        onCategoryChange={(value) => setSelectedCategory(value)}
        onTagChange={(value) => setSelectedTag(value)}
      />

      <div ref={storyScrollRef} className="grid gap-6 lg:grid-cols-[repeat(2,minmax(0,1fr))]">
        {filteredPosts.length === 0 ? (
          <p className="text-peat/60">No posts match your filters yet.</p>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <AuthPanel />
        <PostCreator categories={categories} tags={tags} />
      </div>
    </div>
  )
}
