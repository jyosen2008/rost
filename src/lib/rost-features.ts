import type { Post } from './db'

export const moodReactions = [
  { key: 'felt-this', label: 'felt this' },
  { key: 'too-real', label: 'too real' },
  { key: 'need-part-2', label: 'need part 2' },
  { key: 'cinematic', label: 'cinematic' }
]

export type PostFeatureMeta = {
  isQuickNote: boolean
  isQuoteReact: boolean
  isDrop: boolean
  quoteUrl: string | null
  seriesName: string | null
  episodeNumber: number | null
  dropLabel: string | null
  chainName: string | null
  readingMinutes: number
  summary: string
}

const cleanTag = (tag: string) => tag.trim().toLowerCase()

const words = (value: string) => value.trim().split(/\s+/).filter(Boolean)

export function normalizeFeatureToken(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function getPostFeatureMeta(post: Post): PostFeatureMeta {
  const tags = (post.tags ?? []).map(cleanTag)
  const contentLines = post.content.split('\n').map((line) => line.trim())
  const quoteLine = contentLines.find((line) => line.toLowerCase().startsWith('quote:'))
  const quoteUrl = quoteLine ? quoteLine.replace(/^quote:\s*/i, '') : null
  const seriesTag = tags.find((tag) => tag.startsWith('series:'))
  const episodeTag = tags.find((tag) => tag.startsWith('ep:'))
  const dropTag = tags.find((tag) => tag.startsWith('drop:'))
  const chainTag = tags.find((tag) => tag.startsWith('chain:'))
  const rawWordCount = words(post.content).length
  const readingMinutes = Math.max(1, Math.ceil(rawWordCount / 220))
  const firstParagraph = post.content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find(Boolean)

  return {
    isQuickNote: tags.includes('quick-note'),
    isQuoteReact: tags.includes('quote-react') || Boolean(quoteUrl),
    isDrop: tags.includes('drop') || Boolean(dropTag),
    quoteUrl,
    seriesName: seriesTag ? seriesTag.replace(/^series:/, '').replace(/-/g, ' ') : null,
    episodeNumber: episodeTag ? Number(episodeTag.replace(/^ep:/, '')) || null : null,
    dropLabel: dropTag ? dropTag.replace(/^drop:/, '').replace(/-/g, ' ') : null,
    chainName: chainTag ? chainTag.replace(/^chain:/, '').replace(/-/g, ' ') : null,
    readingMinutes,
    summary: post.excerpt ?? firstParagraph ?? 'A fresh ROST dispatch from the community.'
  }
}

export function getTrendPulse(posts: Post[]) {
  const tags = new Map<string, number>()
  const chains = new Map<string, number>()
  const series = new Map<string, number>()
  const rooms = new Map<string, number>()

  posts.forEach((post) => {
    ;(post.tags ?? []).forEach((tag) => {
      const normalized = cleanTag(tag)
      if (normalized.startsWith('chain:')) {
        chains.set(normalized.replace(/^chain:/, ''), (chains.get(normalized.replace(/^chain:/, '')) ?? 0) + 1)
        return
      }
      if (normalized.startsWith('series:')) {
        series.set(normalized.replace(/^series:/, ''), (series.get(normalized.replace(/^series:/, '')) ?? 0) + 1)
        return
      }
      if (!normalized.startsWith('ep:') && !normalized.startsWith('drop:')) {
        tags.set(normalized, (tags.get(normalized) ?? 0) + 1)
      }
    })
    if (post.category) {
      rooms.set(post.category, (rooms.get(post.category) ?? 0) + 1)
    }
  })

  const top = (map: Map<string, number>) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }))

  return {
    tags: top(tags),
    chains: top(chains),
    series: top(series),
    rooms: top(rooms)
  }
}

export function buildShareText(post: Post) {
  const meta = getPostFeatureMeta(post)
  const prefix = meta.isQuickNote ? 'Quick note' : meta.isQuoteReact ? 'Quote react' : 'ROST story'
  return `${prefix}: ${post.title}\n${meta.summary}`
}
