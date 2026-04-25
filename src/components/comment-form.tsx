'use client'

import { useState, useTransition } from 'react'
import { addCommentAction } from '@/actions/posts'

export default function CommentForm({ postId }: { postId: string }) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={addCommentAction}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4"
      onSubmit={() => {
        startTransition(() => {
          setName('')
          setComment('')
        })
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <input
        name="authorName"
        placeholder="Name (or alias)"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface-raised)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
      />
      <textarea
        name="body"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Leave a thoughtful note"
        rows={3}
        required
        className="rounded-3xl border border-[var(--card-border)] bg-[var(--surface-raised)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-3xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black"
      >
        {isPending ? 'Posting…' : 'Add comment'}
      </button>
    </form>
  )
}
