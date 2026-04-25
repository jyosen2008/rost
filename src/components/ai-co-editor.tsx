'use client'

import { useMemo, useState } from 'react'
import { getCoEditorSuggestions } from '@/lib/co-editor'

type AiCoEditorProps = {
  title: string
  excerpt: string
  content: string
  format: string
  chainName: string
  onTitle: (value: string) => void
  onExcerpt: (value: string) => void
  onContent: (value: string, placement: 'prepend' | 'append') => void
  onAddTags: (tags: string[]) => void
}

const panels = ['Guide me', 'Co-write', 'Polish'] as const

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
  const [panel, setPanel] = useState<(typeof panels)[number]>('Guide me')
  const suggestions = useMemo(
    () => getCoEditorSuggestions({ title, excerpt, content, format, chainName }),
    [title, excerpt, content, format, chainName]
  )

  return (
    <section className="desk-card overflow-hidden p-0">
      <div className="border-b border-[var(--card-border)] bg-[var(--surface-soft)] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[var(--text-subtle)]">Writer assistant</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">Write with a co-pilot, not a mystery box</h3>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              I will guide the shape, suggest your next move, and co-write only when you choose it.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">Current stage</p>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">{suggestions.stage}</p>
            <div className="mt-3 h-2 w-44 rounded-full bg-[var(--surface-raised)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-warm))]"
                style={{ width: `${suggestions.clarityScore}%` }}
              />
            </div>
            <p className="mt-1 text-[0.65rem] text-[var(--text-subtle)]">{suggestions.clarityScore}% draft clarity</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {panels.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPanel(item)}
              className="feature-chip px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]"
              data-active={panel === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[0.8fr,1.2fr]">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">Format goal</p>
          <h4 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{suggestions.formatGuide.label}</h4>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{suggestions.formatGuide.goal}</p>
          <div className="mt-4 space-y-2">
            {suggestions.coachingSteps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{step.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {panel === 'Guide me' ? (
          <div className="space-y-3">
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">What to write next</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{suggestions.formatGuide.next}</p>
            </div>
            <div className="grid gap-2">
              {suggestions.assistantQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onContent(question, 'append')}
                  className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-3 text-left text-sm text-[var(--text-muted)] hover:border-[var(--accent)]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {panel === 'Co-write' ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => onContent(suggestions.dramaticOpening, 'prepend')}
                className="rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left text-sm text-[var(--text-muted)] hover:border-[var(--accent)]"
              >
                <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">Start with this</span>
                {suggestions.hook}
              </button>
              <button
                type="button"
                onClick={() => onContent(suggestions.continuation, 'append')}
                className="rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left text-sm text-[var(--text-muted)] hover:border-[var(--accent)]"
              >
                <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">Continue from here</span>
                {suggestions.continuation}
              </button>
            </div>
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">Suggested outline</p>
              <ol className="ml-4 mt-3 list-decimal space-y-2 text-sm text-[var(--text-muted)]">
                {suggestions.outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}

        {panel === 'Polish' ? (
          <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-3">
              {suggestions.titleIdeas.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => onTitle(idea)}
                  className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-3 text-left text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)]"
                >
                  {idea}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onExcerpt(suggestions.tighterExcerpt)}
              className="w-full rounded-3xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-left text-sm text-[var(--text-muted)] hover:border-[var(--accent)]"
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">Use tighter summary</span>
              {suggestions.tighterExcerpt}
            </button>
            <button
              type="button"
              onClick={() => onExcerpt(suggestions.digestCaption)}
              className="w-full rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-4 text-left text-sm text-[var(--text-muted)] hover:border-[var(--accent)]"
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-[var(--text-subtle)]">Make it digest-ready</span>
              {suggestions.digestCaption}
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[var(--card-border)] px-4 pb-4 pt-3">
        <p className="mb-2 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-subtle)]">Smart tags</p>
        <div className="flex flex-wrap gap-2">
        {suggestions.suggestedTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onAddTags([tag])}
            className="feature-chip px-3 py-1 text-xs font-semibold"
          >
            #{tag}
          </button>
        ))}
        </div>
      </div>
    </section>
  )
}
