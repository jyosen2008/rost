'use client'

import { useState, useTransition } from 'react'
import { addCommentAction } from '@/lib/db'

export default function CommentForm({ postId }: { postId: string }) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={addCommentAction}
      className="flex flex-col gap-3 rounded-2xl border border-peat/10 bg-white/80 p-4"
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
        className="rounded-2xl border border-peat/20 px-4 py-2 text-sm text-peat focus:border-ember focus:outline-none"
      />
      <textarea
        name="body"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Leave a thoughtful note"
        rows={3}
        required
        className="rounded-3xl border border-peat/20 px-4 py-3 text-sm text-peat focus:border-ember focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-3xl bg-peat px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white"
      >
        {isPending ? 'Posting…' : 'Add comment'}
      </button>
    </form>
  )
}
