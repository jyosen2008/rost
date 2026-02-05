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
    <div className="rounded-3xl border border-peat/10 bg-white/80 p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          aria-label="Search posts"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search for essays, journals, or ideas"
          className="w-full rounded-2xl border border-peat/20 px-3 py-2 text-sm text-peat placeholder:text-peat/50 focus:border-ember focus:outline-none"
        />
        <button
          type="button"
          className="rounded-2xl bg-ember px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          onClick={() => onSearch(input)}
        >
          Explore
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.6rem]">
        <span className="font-semibold uppercase tracking-[0.3em] text-peat/80">Filters</span>
        <select
          onChange={(event) => onCategoryChange(event.target.value || null)}
          className="rounded-full border border-peat/10 bg-white px-2 py-1 text-xs"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
