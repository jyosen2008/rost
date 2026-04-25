'use client'

import { useMemo, useState } from 'react'
import type { Post } from '@/lib/db'
import { buildShareText, getPostFeatureMeta } from '@/lib/rost-features'

type PostExperienceProps = {
  post: Post
}

export default function PostExperience({ post }: PostExperienceProps) {
  const [mode, setMode] = useState<'full' | 'skim' | 'listen'>('full')
  const [copied, setCopied] = useState(false)
  const meta = useMemo(() => getPostFeatureMeta(post), [post])
  const paragraphs = useMemo(
    () => post.content.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    [post.content]
  )
  const skimParagraphs = paragraphs.slice(0, 2)
  const dropTime = post.published_at ? new Date(post.published_at).getTime() : null
  const dropLabel = dropTime && dropTime > Date.now()
    ? new Date(dropTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${post.title}. ${meta.summary}`))
  }

  const copyShareCard = async () => {
    if (typeof window === 'undefined') return
    await navigator.clipboard.writeText(`${buildShareText(post)}\n${window.location.href}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="space-y-4">
      <div className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['full', 'skim', 'listen'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item)
                if (item === 'listen') speak()
              }}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                mode === item
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--card-border)] text-[var(--text-muted)]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copyShareCard}
          className="rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]"
        >
          {copied ? 'Copied' : 'Copy story card'}
        </button>
      </div>

      {meta.isDrop ? (
        <div className="vibe-panel p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Live drop event</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {dropLabel ? `Unlocking ${dropLabel}` : meta.dropLabel ? `Drop: ${meta.dropLabel}` : 'This post launched as a ROST drop.'}
          </p>
        </div>
      ) : null}

      {(meta.quoteUrl || meta.responseUrl) ? (
        <div className="vibe-panel p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">
            {meta.responseUrl ? 'Duet source' : 'Quote source'}
          </p>
          <a
            href={meta.responseUrl ?? meta.quoteUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-sm font-semibold text-[var(--accent)]"
          >
            {meta.responseUrl ?? meta.quoteUrl}
          </a>
        </div>
      ) : null}

      <article className="rounded-[28px] border border-[var(--card-border)] bg-[var(--panel-bg)] p-6 text-base leading-relaxed text-[var(--text-muted)]">
        {mode === 'listen' ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-subtle)]">Audio brief</p>
            <p className="text-xl font-semibold text-[var(--text-primary)]">{meta.summary}</p>
            <p>Use this as a quick sample, then switch back to the full read when you want the whole piece.</p>
          </div>
        ) : (
          (mode === 'skim' ? skimParagraphs : paragraphs).map((paragraph) => (
            <p key={paragraph} className="mb-4 text-lg last:mb-0">
              {paragraph.replace(/^quote:\s*/i, '').replace(/^response:\s*/i, '')}
            </p>
          ))
        )}
      </article>
    </section>
  )
}
