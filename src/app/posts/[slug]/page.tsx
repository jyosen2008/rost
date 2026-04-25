import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComments, getPostBySlug } from '@/lib/db'
import CommentForm from '@/components/comment-form'
import PostExperience from '@/components/post-experience'
import { getPostFeatureMeta } from '@/lib/rost-features'
import CommentHighlights from '@/components/comment-highlights'

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

function CommentsList({ comments }: { comments: Awaited<ReturnType<typeof getComments>> }) {
  if (comments.length === 0) {
    return <p className="text-sm text-peat/60">No comments yet. Start the conversation.</p>
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article key={comment.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 text-sm text-[var(--text-muted)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">{comment.author_name}</p>
          <p className="mt-2 text-base text-[var(--text-primary)]">{comment.body}</p>
          <p className="mt-2 text-xs text-[var(--text-subtle)]">{formatDate(comment.created_at)}</p>
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

  const [comments, meta] = await Promise.all([
    getComments(post.id),
    Promise.resolve(getPostFeatureMeta(post))
  ])

  return (
    <main className="mx-auto max-w-4xl space-y-8 rounded-[28px] border border-[var(--panel-border)] bg-[var(--panel-surface)] p-6">
      <Link href="/home" className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
        Return to ROST
      </Link>
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--card-border)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--text-subtle)]">
            {post.category ?? 'Uncategorized'}
          </span>
          {meta.seriesName ? (
            <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--accent)]">
              {meta.seriesName}
            </span>
          ) : null}
          {meta.chainName ? (
            <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--accent)]">
              Chain: {meta.chainName}
            </span>
          ) : null}
          {meta.isResponseEssay ? (
            <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--accent)]">
              Duet essay
            </span>
          ) : null}
          {meta.isAnonymous ? (
            <span className="rounded-full border border-[var(--accent-variant)] bg-[var(--surface-raised)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--accent-variant)]">
              Anonymous verified
            </span>
          ) : null}
        </div>
        <h1 className="text-4xl font-semibold text-[var(--text-primary)]">{post.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {formatDate(post.published_at ?? post.created_at)} · By {post.author_name ?? 'a ROST writer'} · {meta.readingMinutes} min read
        </p>
      </header>
      {post.cover_url ? (
        <div className="relative h-64 overflow-hidden rounded-[28px]">
          <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <PostExperience post={post} />
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Discussion</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-subtle)]">Public</p>
        </div>
        <CommentHighlights comments={comments} />
        <CommentsList comments={comments} />
        <CommentForm postId={post.id} />
      </section>
    </main>
  )
}
