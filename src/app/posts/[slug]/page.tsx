import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComments, getPostBySlug } from '@/lib/db'
import CommentForm from '@/components/comment-form'

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

async function CommentsList({ postId }: { postId: string }) {
  const comments = await getComments(postId)

  if (comments.length === 0) {
    return <p className="text-sm text-peat/60">No comments yet. Start the conversation.</p>
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article key={comment.id} className="rounded-2xl border border-peat/10 bg-white/80 p-4 text-sm text-peat/80">
          <p className="text-xs uppercase tracking-[0.3em] text-peat/60">{comment.author_name}</p>
          <p className="mt-2 text-base text-peat/90">{comment.body}</p>
          <p className="mt-2 text-xs text-peat/50">{formatDate(comment.created_at)}</p>
        </article>
      ))}
    </div>
  )
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-white/40 bg-gradient-to-b from-dawn/80 via-rost/80 to-mist/90 p-6">
      <Link href="/" className="text-sm font-semibold uppercase tracking-[0.4em] text-peat/70">
        ← Return to Röst
      </Link>
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.6em] text-peat/50">{post.category ?? 'Uncategorized'}</p>
        <h1 className="text-4xl font-semibold text-peat">{post.title}</h1>
        <p className="text-sm text-peat/60">
          {formatDate(post.published_at ?? post.created_at)} · By {post.author_name ?? 'a Röst writer'}
        </p>
      </header>
      {post.cover_url ? (
        <div className="relative h-64 overflow-hidden rounded-3xl">
          <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="space-y-4 rounded-3xl border border-peat/10 bg-white/80 p-6 text-base leading-relaxed text-peat/80">
        {post.content.split('\n\n').map((paragraph) => (
          <p key={paragraph} className="text-lg">
            {paragraph}
          </p>
        ))}
      </div>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-peat">Discussion</h2>
          <p className="text-xs uppercase tracking-[0.4em] text-peat/40">Public</p>
        </div>
        <CommentsList postId={post.id} />
        <CommentForm postId={post.id} />
      </section>
    </main>
  )
}
