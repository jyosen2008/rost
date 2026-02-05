import Link from 'next/link'
import { Post } from '@/lib/db'

export default function BookmarkedStories({ posts }: { posts: Post[] }) {
  return (
    <section className="rounded-3xl border border-peat/10 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-peat/60">Bookmarks</p>
          <h3 className="text-2xl font-semibold text-peat">Saved for later</h3>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-peat/50">{posts.length} stored</span>
      </div>
      <div className="mt-4 space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug ?? post.id}`}
            className="block rounded-2xl border border-peat/10 bg-white/70 px-4 py-4 transition hover:border-ember"
          >
            <div className="flex items-center justify-between text-sm text-peat">
              <span className="font-semibold text-peat">{post.title}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-peat/60">
                {new Date(post.published_at ?? post.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-peat/60">{post.excerpt ?? 'Fresh perspectives to revisit.'}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
