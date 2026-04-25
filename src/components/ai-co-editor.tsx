'use client'

import { useMemo } from 'react'
import { getCoEditorSuggestions } from '@/lib/co-editor'

type AiCoEditorProps = {
  title: string
  excerpt: string
  content: string
  format: string
  chainName: string
  onTitle: (value: string) => void
  onExcerpt: (value: string) => void
  onContent: (value: string) => void
  onAddTags: (tags: string[]) => void
}

export default function AiCoEditor({
  title,
  excerpt,
  content,
  format,
  chainName,
  onTitle,
  onExcerpt,
  onContent,
  onAddTags
}: AiCoEditorProps) {
  const suggestions = useMemo(
    () => getCoEditorSuggestions({ title, excerpt, content, format, chainName }),
    [title, excerpt, content, format, chainName]
  )

  return (
    <section className="rounded-[24px] border border-[var(--card-border)] bg-[var(--surface-raised)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[var(--text-subtle)]">AI co-editor</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Shape the piece before it ships</h3>
        </div>
        <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-[var(--accent)]">
          Local
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {suggestions.titleIdeas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onTitle(idea)}
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3 text-left text-sm font-semibold text-[var(--text-primary)]"
          >
            {idea}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onExcerpt(suggestions.tighterExcerpt)}
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3 text-left text-sm text-[var(--text-muted)]"
        >
          <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">Tighter summary</span>
          {suggestions.tighterExcerpt}
        </button>
        <button
          type="button"
          onClick={() => onContent(suggestions.dramaticOpening)}
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3 text-left text-sm text-[var(--text-muted)]"
        >
          <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">Dramatic opening</span>
          {suggestions.hook}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.suggestedTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onAddTags([tag])}
            className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
          >
            #{tag}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onExcerpt(suggestions.digestCaption)}
          className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
        >
          Use digest caption
        </button>
      </div>
    </section>
  )
}
