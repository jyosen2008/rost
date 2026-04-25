'use client'

import Link from 'next/link'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
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
  tags: string[] | null
}

type SearchMode = 'users' | 'posts'

type SearchModalProps = {
  open: boolean
  onClose: () => void
}

const SEARCH_MODES = [
  { value: 'posts', label: 'Explore posts' },
  { value: 'users', label: 'Find writers' }
]

const normalizeHashtag = (value: string) => value.replace(/^#+/, '').trim().toLowerCase()

const formatFilters = [
  { value: '', label: 'Any format' },
  { value: 'quick-note', label: 'Quick notes' },
  { value: 'quote-react', label: 'Quote reacts' },
  { value: 'response-essay', label: 'Duet essays' },
  { value: 'drop', label: 'Live drops' },
  { value: 'anonymous-verified', label: 'Anon verified' }
]

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [mode, setMode] = useState<SearchMode>('posts')
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState<ProfileResult[]>([])
  const [postQuery, setPostQuery] = useState('')
  const [postCategory, setPostCategory] = useState<string>('')
  const [postFormat, setPostFormat] = useState<string>('')
  const [postHashtag, setPostHashtag] = useState('')
  const [postResults, setPostResults] = useState<PostResult[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const deferredPostQuery = useDeferredValue(postQuery)
  const activeFilterCount = useMemo(
    () => [postCategory, postFormat, postHashtag.trim()].filter(Boolean).length,
    [postCategory, postFormat, postHashtag]
  )

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
    setMode('posts')
    setUserQuery('')
    setUserResults([])
    setPostQuery('')
    setPostCategory('')
    setPostFormat('')
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
      .select('id, title, slug, category, excerpt, author_name, published_at, tags')
      .order('published_at', { ascending: false })
      .limit(20)

    const trimmed = deferredPostQuery.trim()
    if (trimmed) {
      query = query.or(`title.ilike.%${trimmed}%,excerpt.ilike.%${trimmed}%`)
    }
    if (postCategory) {
      query = query.eq('category', postCategory)
    }
    if (postFormat && postFormat !== 'story') {
      query = query.contains('tags', [postFormat])
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
  }, [deferredPostQuery, postCategory, postFormat, postHashtag])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="studio-shell max-h-[92vh] w-full max-w-5xl overflow-y-auto p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-subtle)]">ROST map</p>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Search by room, format, tag, or writer</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Think of this as the front desk: ask for a vibe, a room, or the person who wrote it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="action-pill px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            Close
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {SEARCH_MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value as SearchMode)}
              className="feature-chip min-w-[170px] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em]"
              data-active={mode === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === 'users' ? (
          <section className="mt-5 space-y-4">
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
                  className="field-control flex-1 px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  className="primary-pill px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em]"
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
                    className="desk-card flex flex-col px-4 py-3 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
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
          <section className="mt-5 space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                runPostSearch()
              }}
              className="desk-card flex flex-col gap-4 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">Search posts</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{activeFilterCount} active filters</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPostCategory('')
                    setPostFormat('')
                    setPostHashtag('')
                  }}
                  className="action-pill px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]"
                >
                  Reset filters
                </button>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row">
                <input
                  value={postQuery}
                  onChange={(event) => setPostQuery(event.target.value)}
                  placeholder="Post title, phrase, or keyword"
                  className="field-control flex-1 px-4 py-3 text-sm"
                />
                <select
                  value={postCategory}
                  onChange={(event) => setPostCategory(event.target.value)}
                  className="field-control lg:max-w-[240px] px-4 py-3 text-sm"
                >
                  <option value="">Any room</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr,1fr]">
                <div className="space-y-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Formats</p>
                  <div className="flex flex-wrap gap-2">
                    {formatFilters.map((item) => (
                      <button
                        key={item.value || 'all-formats'}
                        type="button"
                        onClick={() => setPostFormat(item.value)}
                        className="feature-chip px-3 py-2 text-xs font-semibold"
                        data-active={postFormat === item.value}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Tags</label>
                <input
                  value={postHashtag}
                  onChange={(event) => setPostHashtag(event.target.value)}
                    placeholder="#reflection #night"
                    className="field-control px-4 py-3 text-sm"
                />
                </div>
              </div>
              <button
                type="submit"
                className="primary-pill px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em]"
              >
                {loading ? 'Searching…' : 'Search posts'}
              </button>
            </form>
            <div className="space-y-3">
              {postResults.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No posts yet. Try widening the search.</p>
              ) : (
                postResults.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="desk-card flex flex-col gap-2 px-4 py-3 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
                  >
                    <span className="text-[var(--text-primary)] font-semibold">{post.title}</span>
                    <span className="text-xs tracking-widest text-[var(--text-subtle)]">
                      {post.category ?? 'Uncategorized'} • {post.author_name ?? 'Röst storyteller'}
                    </span>
                    {post.excerpt ? <span className="text-xs text-[var(--text-muted)]">{post.excerpt}</span> : null}
                    {post.tags?.length ? (
                      <span className="flex flex-wrap gap-2 pt-1">
                        {post.tags.slice(0, 5).map((tag) => (
                          <span key={`${post.id}-${tag}`} className="feature-chip px-2 py-1 text-[0.65rem]">
                            #{tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
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
