type WriterSpotlightProps = {
  topWriter: { name: string; count: number } | null
  otherWriters: { name: string; count: number }[]
  totalWriters: number
}

export default function WriterSpotlight({ topWriter, otherWriters, totalWriters }: WriterSpotlightProps) {
  return (
    <section className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/90 to-slate-100 p-5 shadow-lg shadow-peat/20 dark:from-peat/90 dark:to-peat/70 dark:border-rose/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.4em] text-peat/60 dark:text-rose/200">Writer spotlight</p>
          <h3 className="text-2xl font-semibold text-peat dark:text-white">
            {topWriter ? topWriter.name : 'You'}
          </h3>
        </div>
        <div className="rounded-full border border-peat/20 bg-white/70 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-peat/50 dark:border-rose/40 dark:bg-peat/80 dark:text-rose/200">
          {totalWriters} voices
        </div>
      </div>
      <p className="mt-2 text-sm text-peat/70 dark:text-rose/150">
        {topWriter
          ? `Leads the scroll with ${topWriter.count} shared story${topWriter.count === 1 ? '' : 'ies'}.`
          : 'Be the first voice to stake a claim on this scroll.'}
      </p>
      {topWriter && (
        <div className="mt-3 space-y-1 text-[0.65rem] uppercase tracking-[0.3em] text-peat/60 dark:text-rose/150">
          <p>{topWriter.name} vibes with community notes and subtle essays.</p>
          <p>Always open to reflections, art, and quietly brilliant ideas.</p>
        </div>
      )}
      {otherWriters.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-peat/10 pt-4 text-xs text-peat/70 dark:border-rose/30 dark:text-rose/150">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-peat/60 dark:text-rose/200">Rising voices</p>
          {otherWriters.map((writer) => (
            <div key={writer.name} className="flex items-center justify-between">
              <span className="text-[0.85rem] font-semibold text-peat dark:text-white">{writer.name}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-peat/50 dark:text-rose/200">
                {writer.count} story{writer.count === 1 ? '' : 'ies'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
