'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { Post } from '@/lib/db'

const SCROLL_STEP = 420

export default function FeaturedCarousel({ posts }: { posts: Post[] }) {
  const railRef = useRef<HTMLDivElement>(null)

  if (posts.length === 0) {
    return null
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return
    const offset = direction === 'left' ? -SCROLL_STEP : SCROLL_STEP
    railRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-peat/60">Featured</p>
          <h2 className="text-2xl font-semibold text-peat">Carousel of standout voices</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="flex items-center justify-center rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-peat/70 shadow-sm transition hover:border-peat/60"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="flex items-center justify-center rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-peat/70 shadow-sm transition hover:border-peat/60"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth"
      >
        {posts.map((post) => (
          <article
            key={post.id}
            className="group snap-start w-72 shrink-0 rounded-3xl border border-white/40 bg-white/80 shadow-2xl shadow-peat/10 transition hover:-translate-y-1"
          >
            <Link href={`/posts/${post.slug ?? post.id}`} className="flex flex-col">
              {post.cover_url ? (
                <div className="relative h-48 overflow-hidden rounded-t-3xl">
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-peat/80 via-peat/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-xs uppercase tracking-[0.4em] text-white/90">
                    {post.category ?? 'Story'}
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-t-3xl bg-peat/10 text-xs uppercase tracking-[0.5em] text-peat/60">
                  No cover
                </div>
              )}
              <div className="space-y-2 px-4 pb-5 pt-4">
                <h3 className="text-lg font-semibold leading-tight text-peat">{post.title}</h3>
                <p className="text-sm leading-relaxed text-peat/70">{post.excerpt ?? 'An open call for your words.'}</p>
                <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-peat/40">
                  <span>By {post.author_name ?? 'a Röst writer'}</span>
                  <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
