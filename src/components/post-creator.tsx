'use client'

import ImageUploader from './image-uploader'
import { useState } from 'react'

type PostCreatorProps = {
  categories: string[]
  tags: string[]
}

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
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
          tags: selectedTags,
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
      setCoverUrl('')
      setTagInput('')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag])
    }
    setTagInput('')
  }

  return (
    <section className="rounded-3xl border border-peat/10 bg-white/80 p-6">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-peat/60">
        <span>New dispatch</span>
        <span className="text-[0.65rem] text-peat/40">Only signed-in creators can publish</span>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
          className="rounded-2xl border border-peat/20 px-4 py-3 text-lg font-semibold text-peat focus:border-ember focus:outline-none"
        />
        <input
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="Short summary"
          className="rounded-2xl border border-peat/20 px-4 py-3 text-sm text-peat focus:border-ember focus:outline-none"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write something beautiful for the community"
          required
          rows={6}
          className="h-36 rounded-3xl border border-peat/20 px-4 py-3 text-base text-peat focus:border-ember focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-full border border-peat/20 bg-white px-4 py-2 text-sm"
          >
            <option value="">Choose category</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-peat/20 px-3 py-2">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="Add tag"
              className="flex-1 border-none bg-transparent p-0 text-sm text-peat focus:outline-none"
            />
            <button
              type="button"
              onClick={addTag}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-ember"
            >
              Add
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span key={tag} className="rounded-full bg-sage/30 px-3 py-1 text-xs font-semibold text-sage">
              {tag}
            </span>
          ))}
        </div>
        <ImageUploader onUpload={(url) => setCoverUrl(url)} />
        <input
          value={coverUrl}
          onChange={(event) => setCoverUrl(event.target.value)}
          placeholder="Cover image URL (optional)"
          className="rounded-2xl border border-peat/20 px-4 py-3 text-sm text-peat focus:border-ember focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-3xl bg-peat px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white"
        >
          {loading ? 'Publishing…' : 'Share with Röst'}
        </button>
        {status ? <p className="text-sm text-peat/70">{status}</p> : null}
      </form>
    </section>
  )
}
