'use client'

import { Post } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { buildShareText, getPostFeatureMeta, getStoryHeatScore, moodReactions } from '@/lib/rost-features'
import { useEffect, useMemo, useState } from 'react'

type PostCardProps = {
  post: Post
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
  likeCount?: number
  liked?: boolean
  onToggleLike?: () => void
}

export default function PostCard({
  post,
  isBookmarked = false,
  onBookmarkToggle,
  likeCount = 0,
  liked = false,
  onToggleLike
}: PostCardProps) {
  const meta = useMemo(() => getPostFeatureMeta(post), [post])
  const heatScore = useMemo(
    () => getStoryHeatScore(post, likeCount, isBookmarked ? 1 : 0),
    [post, likeCount, isBookmarked]
  )
  const [reaction, setReaction] = useState<string | null>(null)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setReaction(window.localStorage.getItem(`rost-reaction-${post.id}`))
  }, [post.id])

  const selectReaction = (key: string) => {
    const next = reaction === key ? null : key
    setReaction(next)
    if (typeof window === 'undefined') return
    if (next) {
      window.localStorage.setItem(`rost-reaction-${post.id}`, next)
    } else {
      window.localStorage.removeItem(`rost-reaction-${post.id}`)
    }
  }

  const copyShareCard = async () => {
    if (typeof window === 'undefined') return
    await navigator.clipboard.writeText(`${buildShareText(post)}\n${window.location.origin}/posts/${post.slug ?? post.id}`)
    setShareStatus('Copied')
    window.setTimeout(() => setShareStatus(''), 1600)
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group vibe-panel transform p-6 transition"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase text-[var(--text-subtle)]">
        <span>{post.category ?? 'Uncategorized'}</span>
        <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString()}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {meta.isQuickNote ? <FeatureBadge label="Quick note" /> : null}
        {meta.isQuoteReact ? <FeatureBadge label="Quote react" /> : null}
        {meta.isResponseEssay ? <FeatureBadge label="Duet essay" /> : null}
        {meta.isAnonymous ? <FeatureBadge label="Anon verified" /> : null}
        {meta.seriesName ? <FeatureBadge label={`Series: ${meta.seriesName}`} /> : null}
        {meta.episodeNumber ? <FeatureBadge label={`Ep ${meta.episodeNumber}`} /> : null}
        {meta.isDrop ? <FeatureBadge label={meta.dropLabel ? `Drop: ${meta.dropLabel}` : 'Drop'} /> : null}
        {meta.chainName ? <FeatureBadge label={`Chain: ${meta.chainName}`} /> : null}
      </div>
      <h3 className="mt-3 text-2xl font-semibold leading-tight text-[var(--text-primary)]">
        {post.title}
      </h3>
      <p className="mt-4 text-base text-[var(--text-muted)]">{post.excerpt ?? 'Ideas worth sharing'}</p>
      {meta.isQuoteReact && meta.quoteUrl ? (
        <a
          href={meta.quoteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-2xl border border-[var(--card-border)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--text-muted)]"
        >
          Quote-reacting to: <span className="text-[var(--accent)]">{meta.quoteUrl}</span>
        </a>
      ) : null}
      {meta.isResponseEssay && meta.responseUrl ? (
        <a
          href={meta.responseUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-2xl border border-[var(--card-border)] bg-[var(--surface-raised)] p-4 text-sm text-[var(--text-muted)]"
        >
          Duet essay responding to: <span className="text-[var(--accent)]">{meta.responseUrl}</span>
        </a>
      ) : null}
      {post.cover_url ? (
        <div className="my-4 h-44 overflow-hidden rounded-2xl">
          <Image
            src={post.cover_url}
            width={600}
            height={300}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {(post.tags ?? []).map((tag) => (
          <span
            key={`${post.id}-${tag}`}
            className="rounded-full border border-[var(--card-border)] bg-[var(--accent-soft)] px-3 py-1 font-medium text-[var(--accent)]"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {moodReactions.map((mood) => (
          <button
            key={mood.key}
            type="button"
            onClick={() => selectReaction(mood.key)}
            className={`rounded-full border px-3 py-1 text-[0.7rem] font-semibold ${
              reaction === mood.key
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--card-border)] text-[var(--text-muted)]'
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleLike}
              disabled={!onToggleLike}
              className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] transition ${
                liked
                  ? 'text-[var(--accent-variant)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              } ${!onToggleLike ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              <span aria-hidden="true" className="text-lg">
                {liked ? '♥' : '♡'}
              </span>
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <Link
              href={`/posts/${post.slug ?? post.id}#discussion`}
              className="text-[var(--text-muted)] underline underline-offset-4"
            >
              Comment
            </Link>
            <span className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
              Heat {heatScore}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyShareCard}
              className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]"
            >
              {shareStatus || 'Share card'}
            </button>
            {typeof onBookmarkToggle === 'function' ? (
              <button
                type="button"
                onClick={onBookmarkToggle}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  isBookmarked
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                }`}
              >
                <span aria-hidden="true" className="text-xs">
                  {isBookmarked ? '★' : '☆'}
                </span>
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            ) : null}
            <Link
              href={`/posts/${post.slug ?? post.id}`}
              className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]"
            >
              Read {meta.readingMinutes}m
            </Link>
          </div>
        </div>
        <div className="text-sm font-light text-[var(--text-subtle)]">
          By{' '}
          <Link
            href={`/profiles/${(post.author_name ?? 'guest').toLowerCase().replace(/\s+/g, '-')}`}
            className="underline"
          >
            {post.author_name ?? 'a Röst writer'}
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--card-border)] bg-[var(--accent-soft)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
      {label}
    </span>
  )
}
