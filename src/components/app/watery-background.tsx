'use client'

export default function WateryBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-y-10 -inset-x-8 opacity-70 watery-blob-1" />
      <div className="absolute -inset-y-12 -inset-x-6 opacity-55 watery-blob-2" />
      <div className="absolute inset-0 opacity-30 watery-noise" />
    </div>
  )
}
