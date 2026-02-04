'use client'

import { useState } from 'react'

type SearchFilterProps = {
  categories: string[]
  tags: string[]
  onSearch: (value: string) => void
  onCategoryChange: (category: string | null) => void
  onTagChange: (tag: string | null) => void
}

export default function SearchFilter({
  tags,
  categories,
  onSearch,
  onCategoryChange,
  onTagChange
}: SearchFilterProps) {
  const [input, setInput] = useState('')

  return (
    <div className="rounded-3xl border border-peat/10 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          aria-label="Search posts"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search for essays, journals, or ideas"
          className="w-full rounded-2xl border border-peat/20 px-4 py-3 text-base text-peat placeholder:text-peat/50 focus:border-ember focus:outline-none"
        />
        <button
          type="button"
          className="rounded-2xl bg-ember px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
          onClick={() => onSearch(input)}
        >
          Explore
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="font-semibold uppercase tracking-[0.3em] text-peat/80">Filters</span>
        <select
          onChange={(event) => onCategoryChange(event.target.value || null)}
          className="rounded-full border border-peat/10 bg-white px-3 py-1 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          onChange={(event) => onTagChange(event.target.value || null)}
          className="rounded-full border border-peat/10 bg-white px-3 py-1 text-sm"
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
