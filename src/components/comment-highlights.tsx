type CommentHighlight = {
  id: string
  author_name: string
  body: string
  created_at: string
}

export default function CommentHighlights({ comments }: { comments: CommentHighlight[] }) {
  const highlight = [...comments]
    .filter((comment) => comment.body.length > 40)
    .sort((a, b) => b.body.length - a.body.length)[0]

  if (!highlight) {
    return null
  }

  return (
    <aside className="vibe-panel p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--text-subtle)]">Pinned by the room</p>
      <blockquote className="mt-3 text-lg font-semibold leading-relaxed text-[var(--text-primary)]">
        “{highlight.body}”
      </blockquote>
      <p className="mt-3 text-sm text-[var(--text-muted)]">By {highlight.author_name}</p>
    </aside>
  )
}
