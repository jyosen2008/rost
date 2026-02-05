type LiveStatsProps = {
  postsCount: number
  commentsCount: number
  bookmarksCount: number
  categoriesCount: number
  tagsCount: number
  authorsCount: number
}

export default function LiveStats({
  postsCount,
  commentsCount,
  bookmarksCount,
  categoriesCount,
  tagsCount,
  authorsCount
}: LiveStatsProps) {
  const metrics = [
    {
      label: 'Stories shared',
      value: postsCount,
      detail: 'published and counting'
    },
    {
      label: 'Community replies',
      value: commentsCount,
      detail: 'voices chimed in'
    },
    {
      label: 'Saved stories',
      value: bookmarksCount,
      detail: 'tucked away'
    },
    {
      label: 'Tags cultivated',
      value: tagsCount,
      detail: 'topics to explore'
    },
    {
      label: 'Categories open',
      value: categoriesCount,
      detail: 'creative rooms'
    },
    {
      label: 'Active voices',
      value: authorsCount,
      detail: 'writers on the scroll'
    }
  ]

  return (
    <section className="rounded-3xl border border-peat/10 bg-white/80 p-6 shadow-lg shadow-peat/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-peat/60">Live stats</p>
          <h2 className="text-2xl font-semibold text-peat">The room at a glance</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-peat/40">Updated in real time</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-peat/10 bg-peat/10 p-4 text-sm text-peat/70"
          >
            <p className="text-3xl font-semibold text-peat">{metric.value.toLocaleString()}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-peat/50">{metric.label}</p>
            <p className="mt-1 text-xs text-peat/60">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
