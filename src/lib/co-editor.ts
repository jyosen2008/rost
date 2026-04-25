const trimText = (value: string, max = 160) =>
  value.trim().replace(/\s+/g, ' ').slice(0, max).trim()

const getLead = (content: string) => {
  const first = content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find(Boolean)
  return trimText(first ?? content, 180)
}

const titleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

const FORMAT_GUIDANCE: Record<string, { label: string; goal: string; next: string }> = {
  story: {
    label: 'Story',
    goal: 'Bring the reader into one clear moment, then let the meaning unfold.',
    next: 'Add one specific scene, one feeling, and one turn where something changes.'
  },
  'quick-note': {
    label: 'Quick note',
    goal: 'Make one sharp thought land fast.',
    next: 'Cut setup, keep the strongest sentence, and end with a question or punchline.'
  },
  'quote-react': {
    label: 'Quote react',
    goal: 'Respond to a cultural moment with your own angle.',
    next: 'Name what you agree with, what feels missing, and why your take matters.'
  },
  'response-essay': {
    label: 'Duet essay',
    goal: 'Build on someone else without losing your own voice.',
    next: 'Start by honoring the original point, then add the tension only you can see.'
  },
  drop: {
    label: 'Live drop',
    goal: 'Make the post feel like an event people want to catch now.',
    next: 'Add a countdown-worthy promise: what readers will get if they show up.'
  }
}

export type CoEditorInput = {
  title: string
  excerpt: string
  content: string
  format: string
  chainName: string
}

export function getCoEditorSuggestions(input: CoEditorInput) {
  const lead = getLead(input.content || input.excerpt || input.title)
  const base = trimText(input.title || lead || 'Untitled ROST dispatch', 80)
  const lowerLead = lead.toLowerCase()
  const wordCount = countWords(input.content)
  const formatGuide = FORMAT_GUIDANCE[input.format] ?? FORMAT_GUIDANCE.story
  const mood = lowerLead.includes('love')
    ? 'soft launch'
    : lowerLead.includes('angry') || lowerLead.includes('rage')
    ? 'aftershock'
    : lowerLead.includes('city') || lowerLead.includes('campus')
    ? 'scene report'
    : 'main signal'
  const stage = !input.title && wordCount < 20
    ? 'Find the spark'
    : wordCount < 80
    ? 'Build the shape'
    : input.excerpt.length < 30
    ? 'Clarify the promise'
    : 'Polish for publish'

  const clarityScore = Math.min(
    100,
    28 + Math.min(wordCount, 180) / 3 + (input.title ? 18 : 0) + (input.excerpt ? 16 : 0)
  )

  const titleIdeas = [
    titleCase(base),
    `${titleCase(mood)}: ${titleCase(base)}`,
    `The ${titleCase(base)} Dispatch`
  ]

  const hook = lead
    ? `${lead}${lead.endsWith('.') ? '' : '.'} And somehow, that is where the whole story starts.`
    : 'Start with the sentence you would send to the group chat, then tell the truth underneath it.'

  const tighterExcerpt = trimText(
    input.excerpt ||
      `A ${input.format.replace('-', ' ')} about ${base.toLowerCase()}, built for the people who felt it before they had words for it.`,
    180
  )

  const suggestedTags = Array.from(
    new Set(
      [
        mood.replace(/\s+/g, '-'),
        input.format,
        input.chainName ? `chain:${input.chainName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null,
        lowerLead.includes('campus') ? 'campus' : null,
        lowerLead.includes('love') ? 'heartbreak' : null,
        lowerLead.includes('work') ? 'workplace' : null,
        lowerLead.includes('dream') ? 'dreams' : null
      ].filter(Boolean) as string[]
    )
  )

  const dramaticOpening = lead
    ? `Nobody says the quiet part first.\n\n${lead}\n\nThat was the moment the room changed.`
    : 'Nobody says the quiet part first.\n\nThat is why this belongs on ROST.'

  const continuation = lead
    ? `What makes this worth saying out loud is not just what happened. It is the pattern under it: the tiny habit, the pressure in the room, the thing everyone recognizes but rarely names.`
    : `Start with the truest sentence, then follow it with the detail that proves you were really there.`

  const outline = [
    `Open with: ${lead || 'the exact moment this thought started'}`,
    `Middle: explain why this feels bigger than one person`,
    `Turn: name the conflict, surprise, or contradiction`,
    `Landing: leave readers with a question they want to answer`
  ]

  const coachingSteps = [
    {
      title: '1. Say the point plainly',
      body: input.title ? `Your working promise is "${base}". Keep every paragraph serving that.` : 'Give the piece a plain working title first. Pretty can come later.'
    },
    {
      title: '2. Add proof',
      body: formatGuide.next
    },
    {
      title: '3. Invite the room',
      body: input.chainName
        ? `Because this is tied to "${input.chainName}", end with a prompt others can answer.`
        : 'End with an open loop: a question, a part two, or a line people want to quote.'
    }
  ]

  const assistantQuestions = [
    'What is the one sentence readers should remember?',
    'Where did this feeling first show up in real life?',
    'What would someone disagree with, and how would you answer them?'
  ]

  const digestCaption = `${titleIdeas[0]} is a ${mood} piece with a ${input.format.replace('-', ' ')} pulse.`

  return {
    stage,
    clarityScore: Math.round(clarityScore),
    formatGuide,
    titleIdeas,
    hook,
    tighterExcerpt,
    suggestedTags,
    dramaticOpening,
    continuation,
    outline,
    coachingSteps,
    assistantQuestions,
    digestCaption
  }
}
