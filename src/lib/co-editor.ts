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
  const mood = lowerLead.includes('love')
    ? 'soft launch'
    : lowerLead.includes('angry') || lowerLead.includes('rage')
    ? 'aftershock'
    : lowerLead.includes('city') || lowerLead.includes('campus')
    ? 'scene report'
    : 'main signal'

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

  const digestCaption = `${titleIdeas[0]} is a ${mood} piece with a ${input.format.replace('-', ' ')} pulse.`

  return {
    titleIdeas,
    hook,
    tighterExcerpt,
    suggestedTags,
    dramaticOpening,
    digestCaption
  }
}
