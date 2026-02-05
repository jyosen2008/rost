import { notFound } from 'next/navigation'

export default function HandleProfilePage({ params }: { params: { handle: string } }) {
  if (!params.handle) {
    notFound()
  }

  return (
    <section className="rounded-3xl border border-white/30 bg-gradient-to-br from-white/80 to-slate-100 p-6 text-peat shadow-lg shadow-peat/20 dark:from-peat/90 dark:to-peat/70">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-peat/60 dark:text-rose/200">
        <span>Profile</span>
        <span>·</span>
        <span>{params.handle}</span>
      </div>
      <h1 className="mt-3 text-3xl font-semibold text-peat dark:text-white">@{params.handle}</h1>
      <p className="mt-2 text-sm text-peat/70 dark:text-rose/150">
        Each handle will provide a profile with posts, followers, and followings very soon. This placeholder ensures the new route loads without throwing 404 while the full profile experience is finalized.
      </p>
    </section>
  )
}
