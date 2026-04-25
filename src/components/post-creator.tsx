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

type PostFormat = 'story' | 'quick-note' | 'quote-react' | 'response-essay' | 'drop'

const formatOptions: Array<{ value: PostFormat; label: string; description: string; hint: string }> = [
  {
    value: 'story',
    label: 'Story',
    description: 'A full personal essay, scene, or reflection.',
    hint: 'Best when you want readers to settle in.'
  },
  {
    value: 'quick-note',
    label: 'Quick note',
    description: 'A short take, update, or sharp thought.',
    hint: 'Best for fast, group-chat energy.'
  },
  {
    value: 'quote-react',
    label: 'Quote react',
    description: 'Respond to an article, post, or cultural moment.',
    hint: 'Best when your angle starts from someone else.'
  },
  {
    value: 'response-essay',
    label: 'Duet essay',
    description: 'Write alongside another ROST piece.',
    hint: 'Best for thoughtful back-and-forth chains.'
  },
  {
    value: 'drop',
    label: 'Live drop',
    description: 'Schedule or frame a post like an event.',
    hint: 'Best for launches, series, and reveals.'
  }
]

export default function PostCreator({ categories, tags = [] }: PostCreatorProps) {
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
  const [format, setFormat] = useState<PostFormat>('story')
  const [quoteUrl, setQuoteUrl] = useState('')
  const [responseUrl, setResponseUrl] = useState('')
  const [seriesName, setSeriesName] = useState('')
  const [episodeNumber, setEpisodeNumber] = useState('')
  const [chainName, setChainName] = useState('')
  const [dropLabel, setDropLabel] = useState('')
  const [dropAt, setDropAt] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const normalizeTag = (value: string) => value.replace(/^#+/, '').trim().toLowerCase()
  const activeFormat = formatOptions.find((option) => option.value === format) ?? formatOptions[0]
  const suggestedTags = tags.slice(0, 8)

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

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((current) => current !== tag))
  }

  const insertContent = (value: string, placement: 'prepend' | 'append') => {
    setContent((prev) => {
      if (!prev.trim()) return value
      return placement === 'prepend' ? `${value}\n\n${prev}` : `${prev}\n\n${value}`
    })
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
    <section className="desk-card overflow-hidden">
      <div className="border-b border-[var(--card-border)] bg-[var(--surface-soft)] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-subtle)]">Create studio</p>
            <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Make a post people understand fast</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              Pick the kind of piece, write with guidance, then add room and tags only when they help readers find it.
            </p>
          </div>
          <div className="rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
            {activeFormat.label}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-5 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {formatOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormat(option.value)}
              className="feature-chip p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
              data-active={format === option.value}
            >
              <span className="block text-sm font-semibold text-[var(--text-primary)]">{option.label}</span>
              <span className="mt-1 block text-xs text-[var(--text-muted)]">{option.description}</span>
              <span className="mt-3 block text-[0.65rem] uppercase tracking-[0.24em] text-[var(--text-subtle)]">{option.hint}</span>
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-subtle)]">Step 1: Draft the idea</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{activeFormat.description} {activeFormat.hint}</p>
        </div>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Working title, even if it is messy"
          required
          className="field-control px-4 py-3 text-lg font-semibold"
        />
        <input
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="Promise to the reader in one line"
          className="field-control px-4 py-3 text-sm"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={format === 'quick-note' ? 'Start with the sharpest version of the thought.' : 'Start with the moment, feeling, or argument. The assistant below will help shape it.'}
          required
          rows={format === 'quick-note' ? 3 : 6}
          className="field-control min-h-40 px-4 py-3 text-base leading-7"
        />
        <AiCoEditor
          title={title}
          excerpt={excerpt}
          content={content}
          format={format}
          chainName={chainName}
          onTitle={setTitle}
          onExcerpt={setExcerpt}
          onContent={insertContent}
          onAddTags={addTags}
        />
        {format === 'quote-react' ? (
          <input
            value={quoteUrl}
            onChange={(event) => setQuoteUrl(event.target.value)}
            placeholder="Paste the post, article, or cultural moment you are reacting to"
            className="field-control px-4 py-3 text-sm"
          />
        ) : null}
        {format === 'response-essay' ? (
          <input
            value={responseUrl}
            onChange={(event) => setResponseUrl(event.target.value)}
            placeholder="Paste the ROST post or article you are responding to"
            className="field-control px-4 py-3 text-sm"
          />
        ) : null}
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-subtle)]">Step 2: Help readers find it</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Rooms are broad spaces. Tags are specific signals. Chains and series make posts feel connected.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={seriesName}
            onChange={(event) => setSeriesName(event.target.value)}
            placeholder="Series name"
            className="field-control px-4 py-3 text-sm"
          />
          <input
            value={episodeNumber}
            onChange={(event) => setEpisodeNumber(event.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Episode #"
            inputMode="numeric"
            className="field-control px-4 py-3 text-sm"
          />
          <input
            value={chainName}
            onChange={(event) => setChainName(event.target.value)}
            placeholder="Chain prompt"
            className="field-control px-4 py-3 text-sm"
          />
        </div>
        {format === 'drop' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={dropLabel}
              onChange={(event) => setDropLabel(event.target.value)}
              placeholder="Drop label, launch theme, or event name"
              className="field-control px-4 py-3 text-sm"
            />
            <input
              type="datetime-local"
              value={dropAt}
              onChange={(event) => setDropAt(event.target.value)}
              className="field-control px-4 py-3 text-sm"
            />
          </div>
        ) : null}
        <label className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] px-4 py-3 text-sm text-[var(--text-muted)]">
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
            className="field-control max-w-xs px-4 py-2 text-sm"
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
              className="field-control min-w-[180px] flex-1 px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addTag}
              className="action-pill px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
            >
              Add hashtag
            </button>
          </div>
          {suggestedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedTags.map((tag) => (
                <button
                  key={`suggested-${tag}`}
                  type="button"
                  onClick={() => addTags([tag])}
                  className="feature-chip px-3 py-1 text-xs font-semibold"
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <button
              key={`selected-${tag}`}
              type="button"
              onClick={() => removeTag(tag)}
              className="feature-chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"
            >
              #{tag} x
            </button>
          ))}
        </div>
        <ImageUploader onUpload={(url) => setCoverUrl(url)} />
        <input
          value={coverUrl}
          onChange={(event) => setCoverUrl(event.target.value)}
          placeholder="Cover image URL (optional)"
          className="field-control px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="primary-pill px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Publishing…' : 'Share with Röst'}
        </button>
        {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
      </form>
    </section>
  )
}
