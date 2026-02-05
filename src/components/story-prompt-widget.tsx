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
    <section className="rounded-3xl border border-peat/10 bg-peat/10 p-6 text-sm text-peat/80 shadow-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-peat/60">
        <span>Story prompt</span>
        <button
          type="button"
          onClick={refreshPrompt}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-peat/60"
        >
          Inspire me
        </button>
      </div>
      <p className="mt-4 text-base leading-relaxed text-peat/80">{prompt}</p>
    </section>
  )
}
