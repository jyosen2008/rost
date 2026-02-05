'use client'

import { useState } from 'react'

const prompts = [
  'Write a letter to your future self from a cafe you have never visited.',
  'Describe a small kindness that felt world-changing.',
  'Reimagine a familiar object from the perspective of someone who has never seen it.',
  'Sketch the inner monologue of someone watching a storm from the rooftop.',
  'Tell a story where silence is the loudest character.',
  'Capture the feeling of arriving somewhere hours before the rest of the world wakes up.'
]

const getRandomPrompt = () => prompts[Math.floor(Math.random() * prompts.length)]

export default function StoryPromptWidget() {
  const [prompt, setPrompt] = useState(getRandomPrompt)

  const refreshPrompt = () => {
    setPrompt(getRandomPrompt())
  }

  return (
    <section className="rounded-3xl border border-peat/10 bg-gradient-to-br from-white/90 via-slate-50 to-sage/20 p-5 text-sm text-peat/80 shadow-sm shadow-peat/40 dark:from-peat/90 dark:via-peat/80 dark:to-peat/70 dark:border-rose/30 dark:text-rose/100">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] uppercase tracking-[0.4em]">Story prompt</p>
        <button
          type="button"
          onClick={refreshPrompt}
          className="rounded-full border border-peat/50 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-peat/70 transition hover:border-ember hover:text-ember dark:border-rose/60 dark:text-rose/200"
        >
          Inspire me
        </button>
      </div>
      <p className="mt-3 text-base leading-relaxed text-peat dark:text-white">{prompt}</p>
      <p className="mt-3 text-[0.65rem] uppercase tracking-[0.4em] text-peat/60 dark:text-rose/200">
        Swipe for a fresh spark anytime.
      </p>
    </section>
  )
}
