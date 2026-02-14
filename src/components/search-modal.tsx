'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

type ProfileResult = {
  user_id: string
  handle: string
  display_name: string
  bio: string | null
}

type PostResult = {
  id: string
  title: string
  slug: string
  category: string | null
  excerpt: string | null
  author_name: string | null
  published_at: string | null
}

type SearchMode = 'users' | 'posts'

type SearchModalProps = {
  open: boolean
  onClose: () => void
}

const SEARCH_MODES = [
  { value: 'users', label: 'Search for Röst-ers (Users)' },
  { value: 'posts', label: 'Search for Rösts (Posts)' }
]

const normalizeHashtag = (value: string) => value.replace(/^#+/, '').trim()

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [mode, setMode] = useState<SearchMode>('users')
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState<ProfileResult[]>([])
  const [postQuery, setPostQuery] = useState('')
  const [postCategory, setPostCategory] = useState<string>('')
  const [postHashtag, setPostHashtag] = useState('')
  const [postResults, setPostResults] = useState<PostResult[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const fetchCategories = async () => {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('name')
        .order('name')

      if (!active) return
      if (error) {
        console.error('Loading categories failed', error)
        return
      }
      setCategories(((data ?? []) as { name: string }[]).map((row) => row.name))
    }
    fetchCategories()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setMode('users')
    setUserQuery('')
    setUserResults([])
    setPostQuery('')
    setPostCategory('')
    setPostHashtag('')
    setPostResults([])
  }, [open])

  const runUserSearch = useCallback(async () => {
    const trimmed = userQuery.trim()
    if (!trimmed) {
      setUserResults([])
      return
    }
    setLoading(true)
    const orQuery = `handle.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('user_id, handle, display_name, bio')
      .or(orQuery)
      .order('display_name')
      .limit(16)
    setLoading(false)
    if (error) {
      console.error('User search failed', error)
      setUserResults([])
      return
    }
    setUserResults((data ?? []) as ProfileResult[])
  }, [userQuery])

  const runPostSearch = useCallback(async () => {
    setLoading(true)
    let query = supabaseClient
      .from('posts')
      .select('id, title, slug, category, excerpt, author_name, published_at')
      .order('published_at', { ascending: false })
      .limit(20)

    const trimmed = postQuery.trim()
    if (trimmed) {
      query = query.ilike('title', `%${trimmed}%`).or(`excerpt.ilike.%${trimmed}%`)
    }
    if (postCategory) {
      query = query.eq('category', postCategory)
    }

    const hashtagFilters = postHashtag
      .split(/\s+/)
      .map(normalizeHashtag)
      .filter(Boolean)

    if (hashtagFilters.length) {
      query = query.overlaps('tags', hashtagFilters)
    }

    const { data, error } = await query
    setLoading(false)
    if (error) {
      console.error('Post search failed', error)
      setPostResults([])
      return
    }
    setPostResults((data ?? []) as PostResult[])
  }, [postQuery, postCategory, postHashtag])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl space-y-6 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">Search</p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Find the story or storyteller you’re after</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]"
          >
            Close
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {SEARCH_MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value as SearchMode)}
              className={`min-w-[200px] rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                mode === item.value
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-muted)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === 'users' ? (
          <section className="space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                runUserSearch()
              }}
              className="flex flex-col gap-3"
            >
              <label className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">
                Search handles or names
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="e.g. @writer, Samira, b2c51c..."
                  className="flex-1 rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black"
                >
                  {loading ? 'Searching…' : 'Search users'}
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {userResults.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No accounts yet. Try another handle.</p>
              ) : (
                userResults.map((profile) => (
                  <Link
                    key={profile.user_id}
                    href={`/profiles/${profile.handle}`}
                    className="flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                  >
                    <span className="text-[var(--text-primary)] font-semibold">{profile.display_name}</span>
                    <span className="text-xs tracking-widest text-[var(--text-subtle)]">@{profile.handle}</span>
                    {profile.bio ? <span className="mt-1 text-xs text-[var(--text-muted)]">{profile.bio}</span> : null}
                  </Link>
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                runPostSearch()
              }}
              className="flex flex-col gap-3"
            >
              <label className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">
                Search Röst titles or categories
              </label>
              <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={postQuery}
                  onChange={(event) => setPostQuery(event.target.value)}
                  placeholder="Post title, phrase, or keyword"
                  className="flex-1 rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
                />
                <select
                  value={postCategory}
                  onChange={(event) => setPostCategory(event.target.value)}
                  className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="">Any category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Hashtags</label>
                <input
                  value={postHashtag}
                  onChange={(event) => setPostHashtag(event.target.value)}
                  placeholder="#reflection #night"
                  className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black"
              >
                {loading ? 'Searching…' : 'Search posts'}
              </button>
            </div>
            </form>
            <div className="space-y-3">
              {postResults.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No posts yet. Try widening the search.</p>
              ) : (
                postResults.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="flex flex-col gap-1 rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                  >
                    <span className="text-[var(--text-primary)] font-semibold">{post.title}</span>
                    <span className="text-xs tracking-widest text-[var(--text-subtle)]">
                      {post.category ?? 'Uncategorized'} • {post.author_name ?? 'Röst storyteller'}
                    </span>
                    {post.excerpt ? <span className="text-xs text-[var(--text-muted)]">{post.excerpt}</span> : null}
                  </Link>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
