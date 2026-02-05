'use client'

type TagPillsProps = {
  tags: string[]
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
}

export default function TagPills({ tags, selectedTag, onTagSelect }: TagPillsProps) {
  return (
    <div className="rounded-3xl border border-peat/10 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-peat/70">Mood tags</p>
        <button
          type="button"
          onClick={() => onTagSelect(null)}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-peat/60"
        >
          Clear all
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selectedTag === tag
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(isActive ? null : tag)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                isActive
                  ? 'border-ember bg-ember/10 text-ember'
                  : 'border-white/40 bg-white/60 text-peat/70 hover:border-sage/50'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
