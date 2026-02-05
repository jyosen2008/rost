'use client'

import { useState } from 'react'

type SearchFilterProps = {
  categories: string[]
  onSearch: (value: string) => void
  onCategoryChange: (category: string | null) => void
}

export default function SearchFilter({
  categories,
  onSearch,
  onCategoryChange
}: SearchFilterProps) {
  const [input, setInput] = useState('')

  return (
    <section className="rounded-3xl border border-peat/10 bg-gradient-to-br from-white/95 to-slate-100 p-3 shadow-lg shadow-peat/10 dark:from-peat/95 dark:to-peat/70 dark:border-peat/20">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          aria-label="Search posts"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search for essays, journals, or ideas"
          className="w-full rounded-2xl border border-peat/20 bg-white/70 px-3 py-2 text-sm text-peat placeholder:text-peat/50 focus:border-ember focus:outline-none dark:border-rose/40 dark:bg-peat/80 dark:text-white"
        />
        <button
          type="button"
          className="rounded-2xl bg-ember px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_4px_15px_rgba(255,155,112,0.5)]"
          onClick={() => onSearch(input)}
        >
          Explore
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.6rem] text-peat/80 dark:text-rose/100">
        <span className="font-semibold uppercase tracking-[0.3em]">Filters</span>
        <select
          onChange={(event) => onCategoryChange(event.target.value || null)}
          className="rounded-full border border-peat/10 bg-white px-2 py-1 text-xs dark:border-rose/40 dark:bg-peat/80 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
