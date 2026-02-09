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
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl glass-panel">
        {title ? (
          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-5 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full border border-[var(--card-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]"
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
