'use client'

import clsx from 'clsx'
import { motion } from 'framer-motion'
import { useTheme } from './theme-provider'

type ThemeToggleProps = {
  compact?: boolean
  className?: string
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 1011 21a9 9 0 0010-8.21z" />
  </svg>
)

export default function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const icon = theme === 'dark' ? <MoonIcon /> : <SunIcon />

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={compact ? 'Toggle theme' : 'Toggle dark/light mode'}
      className={clsx(
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
        compact
          ? 'flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)]'
          : 'inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)]',
        className
      )}
    >
      {compact ? (
        icon
      ) : (
        <>
          <motion.span
            key={theme}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {theme === 'dark' ? 'Night' : 'Day'}
          </motion.span>
          <span className="text-xs text-[var(--text-muted)]">mode</span>
        </>
      )}
    </button>
  )
}
