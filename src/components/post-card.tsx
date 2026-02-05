'use client'

import { Post } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group transform rounded-3xl border border-white/40 bg-white/70 p-6 shadow-2xl shadow-peat/10 transition"
    >
      <div className="flex items-center justify-between text-xs uppercase text-peat/60">
        <span>{post.category ?? 'Uncategorized'}</span>
        <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString()}</span>
      </div>
      <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-peat">
        {post.title}
      </h3>
      <p className="mt-4 text-base text-peat/70">{post.excerpt ?? 'Ideas worth sharing'}</p>
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
            className="rounded-full border border-sage/40 bg-sage/10 px-3 py-1 font-medium text-sage"
          >
            {tag}
          </span>
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
                  ? 'text-ember'
                  : 'text-peat/60 hover:text-peat'
              } ${!onToggleLike ? 'cursor-not-allowed text-peat/30' : ''}`}
            >
              <span aria-hidden="true" className="text-lg">
                {liked ? '♥' : '♡'}
              </span>
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <Link
              href={`/posts/${post.slug ?? post.id}#discussion`}
              className="text-peat/60 underline underline-offset-4"
            >
              Comment
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {typeof onBookmarkToggle === 'function' ? (
              <button
                type="button"
                onClick={onBookmarkToggle}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  isBookmarked
                    ? 'border-ember/70 bg-ember/10 text-ember'
                    : 'border-white/40 text-peat/70 hover:border-peat/60'
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
              className="text-sm font-semibold uppercase tracking-[0.3em] text-ember"
            >
              Read
            </Link>
          </div>
        </div>
        <div className="text-sm font-light text-peat/60">
          By{' '}
          <Link href={`/profiles/${post.author_id ?? post.author_name ?? 'guest'}`} className="underline">
            {post.author_name ?? 'a Röst writer'}
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
