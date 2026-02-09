'use client'

import ImageUploader from './image-uploader'
import { useMemo, useState } from 'react'

type PostCreatorProps = {
  categories: string[]
  tags: string[]
}

const moodOptions = [
  'Dreams',
  'Stillness',
  'Wander',
  'Letters',
  'Reflection',
  'Art',
  'Night',
  'Breeze',
  'Memory',
  'Quietude'
]

export default function PostCreator({ categories, tags }: PostCreatorProps) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMoodTags, setSelectedMoodTags] = useState<string[]>([])

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag])
    }
    setTagInput('')
  }

  const toggleMoodTag = (tag: string) => {
    if (selectedMoodTags.includes(tag)) {
      setSelectedMoodTags((prev) => prev.filter((current) => current !== tag))
      setSelectedTags((prev) => prev.filter((current) => current !== tag))
      return
    }
    setSelectedMoodTags((prev) => [...prev, tag])
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const combinedTags = Array.from(new Set([...selectedTags, ...selectedMoodTags]))
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
          coverUrl
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
      setSelectedMoodTags([])
      setCoverUrl('')
      setTagInput('')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const moodTagPills = useMemo(() => selectedMoodTags, [selectedMoodTags])

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
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-2">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="Add tag"
              className="flex-1 border-none bg-transparent p-0 text-sm text-[var(--text-muted)] focus:outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
            >
              Add
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((tag) => {
            const active = selectedMoodTags.includes(tag)
            return (
              <button
                key={`mood-${tag}`}
                type="button"
                onClick={() => toggleMoodTag(tag)}
                className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {moodTagPills.map((tag) => (
            <span
              key={`selected-${tag}`}
              className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
            >
              {tag}
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
