'use client'

type TagPillsProps = {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClear: () => void
}

export default function TagPills({ tags, selectedTags, onTagToggle, onClear }: TagPillsProps) {
  return (
    <section className="rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3 shadow-sm shadow-black/10">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--text-subtle)]">Mood tags</p>
        <button
          type="button"
          onClick={onClear}
          className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
        >
          Clear all
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagToggle(tag)}
              className={`rounded-full border px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.3em] transition ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_0_1px_rgba(255,255,255,0.8)]'
                  : 'border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </section>
  )
}
