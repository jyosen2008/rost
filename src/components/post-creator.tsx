'use client'

import ImageUploader from './image-uploader'
import { useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useProfileStats } from '@/hooks/use-profile-stats'
import { useRostStreak } from '@/hooks/use-rost-streak'
import { normalizeFeatureToken } from '@/lib/rost-features'
import AiCoEditor from './ai-co-editor'

type PostCreatorProps = {
  categories: string[]
  tags?: string[]
}

export default function PostCreator({ categories }: PostCreatorProps) {
  const { user } = useSession()
  const { profile } = useProfileStats(user?.id ?? null)
  const { markDraft } = useRostStreak()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [format, setFormat] = useState<'story' | 'quick-note' | 'quote-react' | 'response-essay' | 'drop'>('story')
  const [quoteUrl, setQuoteUrl] = useState('')
  const [responseUrl, setResponseUrl] = useState('')
  const [seriesName, setSeriesName] = useState('')
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [chainName, setChainName] = useState('')
  const [dropLabel, setDropLabel] = useState('')
  const [dropAt, setDropAt] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const normalizeTag = (value: string) => value.replace(/^#+/, '').trim().toLowerCase()

  const addTag = () => {
    const raw = normalizeTag(tagInput)
    if (raw && !selectedTags.includes(raw)) {
      setSelectedTags((prev) => [...prev, raw])
    }
    setTagInput('')
  }

  const addTags = (tags: string[]) => {
    setSelectedTags((prev) => Array.from(new Set([...prev, ...tags.map(normalizeTag).filter(Boolean)])))
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
      const featureTags = [
        format !== 'story' ? format : null,
        format === 'drop' ? 'drop' : null,
        anonymous ? 'anonymous-verified' : null,
        seriesName.trim() ? `series:${normalizeFeatureToken(seriesName)}` : null,
        episodeNumber.trim() ? `ep:${episodeNumber.trim()}` : null,
        chainName.trim() ? `chain:${normalizeFeatureToken(chainName)}` : null,
        dropLabel.trim() ? `drop:${normalizeFeatureToken(dropLabel)}` : null
      ].filter(Boolean) as string[]
      const combinedTags = Array.from(new Set([...selectedTags, ...featureTags]))
      const contentPrelude = [
        format === 'quote-react' && quoteUrl.trim() ? `Quote: ${quoteUrl.trim()}` : null,
        format === 'response-essay' && responseUrl.trim() ? `Response: ${responseUrl.trim()}` : null
      ].filter(Boolean)
      const decoratedContent = contentPrelude.length ? `${contentPrelude.join('\n')}\n\n${content}` : content
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          excerpt,
          content: decoratedContent,
          category,
          tags: combinedTags,
          coverUrl,
          dropAt,
          authorId: user.id,
          authorName: anonymous ? 'Anonymous ROST-er' : profile?.display_name ?? user.email ?? 'ROST storyteller'
        })
      })
      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error ?? 'Unable to publish')
      }
      setStatus('Post queued for publication—refresh to see it live.')
      markDraft()
      setTitle('')
      setExcerpt('')
      setContent('')
      setCategory('')
      setSelectedTags([])
      setCoverUrl('')
      setTagInput('')
      setFormat('story')
      setQuoteUrl('')
      setResponseUrl('')
      setSeriesName('')
      setEpisodeNumber('')
      setChainName('')
      setDropLabel('')
      setDropAt('')
      setAnonymous(false)
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
        <div className="grid gap-2 sm:grid-cols-5">
          {[
            ['story', 'Story'],
            ['quick-note', 'Quick note'],
            ['quote-react', 'Quote react'],
            ['response-essay', 'Duet essay'],
            ['drop', 'Drop']
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormat(value as typeof format)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${
                format === value
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--card-border)] text-[var(--text-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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
          placeholder={format === 'quick-note' ? 'Drop a sharp thought, update, or take' : 'Write something beautiful for the community'}
          required
          rows={format === 'quick-note' ? 3 : 6}
          className="h-36 rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-base text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        />
        <AiCoEditor
          title={title}
          excerpt={excerpt}
          content={content}
          format={format}
          chainName={chainName}
          onTitle={setTitle}
          onExcerpt={setExcerpt}
          onContent={(value) => setContent((prev) => (prev.trim() ? `${value}\n\n${prev}` : value))}
          onAddTags={addTags}
        />
        {format === 'quote-react' ? (
          <input
            value={quoteUrl}
            onChange={(event) => setQuoteUrl(event.target.value)}
            placeholder="Paste the post, article, or cultural moment you are reacting to"
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        ) : null}
        {format === 'response-essay' ? (
          <input
            value={responseUrl}
            onChange={(event) => setResponseUrl(event.target.value)}
            placeholder="Paste the ROST post or article you are responding to"
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={seriesName}
            onChange={(event) => setSeriesName(event.target.value)}
            placeholder="Series name"
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <input
            value={episodeNumber}
            onChange={(event) => setEpisodeNumber(event.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Episode #"
            inputMode="numeric"
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <input
            value={chainName}
            onChange={(event) => setChainName(event.target.value)}
            placeholder="Chain prompt"
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        {format === 'drop' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={dropLabel}
              onChange={(event) => setDropLabel(event.target.value)}
              placeholder="Drop label, launch theme, or event name"
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            <input
              type="datetime-local"
              value={dropAt}
              onChange={(event) => setDropAt(event.target.value)}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        ) : null}
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--surface-raised)] px-4 py-3 text-sm text-[var(--text-muted)]">
          <span>
            <span className="block font-semibold text-[var(--text-primary)]">Anonymous verified story</span>
            <span className="text-xs text-[var(--text-subtle)]">Your account stays attached privately, public readers see Anonymous ROST-er.</span>
          </span>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
            className="h-5 w-5 accent-[var(--accent)]"
          />
        </label>
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
