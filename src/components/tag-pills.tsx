'use client'

type TagPillsProps = {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClear: () => void
}

export default function TagPills({ tags, selectedTags, onTagToggle, onClear }: TagPillsProps) {
  return (
    <section className="rounded-3xl border border-peat/10 bg-gradient-to-br from-white/95 to-peat/5 p-3 shadow-sm shadow-peat/10 dark:from-peat/90 dark:to-peat/70 dark:border-peat/30">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-peat/70 dark:text-rose/200">Mood tags</p>
        <button
          type="button"
          onClick={onClear}
          className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-peat/60 dark:text-rose/100"
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
                  ? 'border-ember text-ember bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]'
                  : 'border-white/60 bg-white/80 text-peat/70 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] dark:border-rose/40 dark:bg-peat/80 dark:text-rose/200'
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
