'use client'

import { useTheme } from './theme-provider'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-peat/40 px-4 py-2 text-sm font-semibold transition hover:border-peat/60"
      aria-label="Toggle dark/light mode"
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {theme === 'dark' ? 'Night' : 'Day'}
      </motion.span>
      <span className="text-xs text-peat/70">mode</span>
    </button>
  )
}
