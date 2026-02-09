'use client'

import { ReactNode, useEffect } from 'react'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-2xl shadow-peat/20 dark:bg-peat/90">
        {title ? (
          <div className="flex items-center justify-between border-b border-peat/10 px-5 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-peat/70 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full border border-peat/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-peat/70 dark:text-white"
            >
              Close
            </button>
          </div>
        ) : null}
        <div className="max-h-[75vh] overflow-auto p-5">{children}</div>
      </div>
    </div>
  )
}
