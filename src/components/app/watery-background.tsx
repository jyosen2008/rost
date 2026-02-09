'use client'

export default function WateryBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-20 opacity-90 blur-3xl watery-blob-1" />
      <div className="absolute -inset-20 opacity-70 blur-3xl watery-blob-2" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_55%),radial-gradient(circle_at_80%_35%,rgba(94,234,212,0.35),transparent_55%),radial-gradient(circle_at_55%_75%,rgba(56,189,248,0.25),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay watery-noise" />
    </div>
  )
}
