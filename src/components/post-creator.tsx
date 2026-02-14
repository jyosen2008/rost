'use client'

import ImageUploader from './image-uploader'
import { useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useProfileStats } from '@/hooks/use-profile-stats'

type PostCreatorProps = {
  categories: string[]
  tags?: string[]
}

export default function PostCreator({ categories }: PostCreatorProps) {
  const { user } = useSession()
  const { profile } = useProfileStats(user?.id ?? null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const normalizeTag = (value: string) => value.replace(/^#+/, '').trim().toLowerCase()

  const addTag = () => {
    const raw = normalizeTag(tagInput)
    if (raw && !selectedTags.includes(raw)) {
      setSelectedTags((prev) => [...prev, raw])
    }
    setTagInput('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.id) {
      setStatus('Sign in to publish a piece.')
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      const combinedTags = Array.from(new Set(selectedTags))
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          tags: combinedTags,
          coverUrl,
          authorId: user.id,
          authorName: profile?.display_name ?? user.email ?? 'Röst storyteller'
        })
      })
      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error ?? 'Unable to publish')
      }
      setStatus('Post queued for publication—refresh to see it live.')
      setTitle('')
      setExcerpt('')
      setContent('')
      setCategory('')
      setSelectedTags([])
      setCoverUrl('')
      setTagInput('')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel p-6">
      <div className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
        <span>New dispatch</span>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-lg font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        />
        <input
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="Short summary"
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write something beautiful for the community"
          required
          rows={6}
          className="h-36 rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-base text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="">Choose category</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Hashtags</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="Add a hashtag (e.g. #reflection)"
              className="flex-1 min-w-[180px] rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
            >
              Add hashtag
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={`selected-${tag}`}
              className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
            >
              #{tag}
            </span>
          ))}
        </div>
        <ImageUploader onUpload={(url) => setCoverUrl(url)} />
        <input
          value={coverUrl}
          onChange={(event) => setCoverUrl(event.target.value)}
          placeholder="Cover image URL (optional)"
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-3xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white"
        >
          {loading ? 'Publishing…' : 'Share with Röst'}
        </button>
        {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
      </form>
    </section>
  )
}
