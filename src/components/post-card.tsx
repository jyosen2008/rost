'use client'

import { Post } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function PostCard({ post }: { post: Post }) {
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
      <div className="mt-6 flex items-center justify-between">
        <Link
          href={`/posts/${post.slug ?? post.id}`}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-ember"
        >
          Read
        </Link>
        <span className="text-sm font-light text-peat/60">By {post.author_name ?? 'a Röst writer'}</span>
      </div>
    </motion.article>
  )
}
