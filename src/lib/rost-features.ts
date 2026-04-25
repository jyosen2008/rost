import type { Post } from './db'

export const moodReactions = [
  { key: 'felt-this', label: 'felt this' },
  { key: 'too-real', label: 'too real' },
  { key: 'need-part-2', label: 'need part 2' },
  { key: 'cinematic', label: 'cinematic' },
  { key: 'main-character', label: 'main character' },
  { key: 'brain-tingle', label: 'brain tingle' }
]

export type PostFeatureMeta = {
  isQuickNote: boolean
  isQuoteReact: boolean
  isResponseEssay: boolean
  isAnonymous: boolean
  isDrop: boolean
  quoteUrl: string | null
  responseUrl: string | null
  seriesName: string | null
  episodeNumber: number | null
  dropLabel: string | null
  chainName: string | null
  readingMinutes: number
  summary: string
  heatScore: number
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
  const responseLine = contentLines.find((line) => line.toLowerCase().startsWith('response:'))
  const quoteUrl = quoteLine ? quoteLine.replace(/^quote:\s*/i, '') : null
  const responseUrl = responseLine ? responseLine.replace(/^response:\s*/i, '') : null
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
    isResponseEssay: tags.includes('response-essay') || Boolean(responseUrl),
    isAnonymous: tags.includes('anonymous-verified'),
    isDrop: tags.includes('drop') || Boolean(dropTag),
    quoteUrl,
    responseUrl,
    seriesName: seriesTag ? seriesTag.replace(/^series:/, '').replace(/-/g, ' ') : null,
    episodeNumber: episodeTag ? Number(episodeTag.replace(/^ep:/, '')) || null : null,
    dropLabel: dropTag ? dropTag.replace(/^drop:/, '').replace(/-/g, ' ') : null,
    chainName: chainTag ? chainTag.replace(/^chain:/, '').replace(/-/g, ' ') : null,
    readingMinutes,
    summary: post.excerpt ?? firstParagraph ?? 'A fresh ROST dispatch from the community.',
    heatScore: getStoryHeatScore(post)
  }
}

export function getStoryHeatScore(post: Post, likeCount = 0, bookmarkBoost = 0) {
  const ageHours = Math.max(
    1,
    (Date.now() - new Date(post.published_at ?? post.created_at).getTime()) / 36e5
  )
  const tags = post.tags ?? []
  const freshness = Math.max(0, 80 - ageHours * 1.8)
  const formatBoost = tags.some((tag) => ['quick-note', 'quote-react', 'drop', 'response-essay'].includes(cleanTag(tag)))
    ? 18
    : 6
  const chainBoost = tags.some((tag) => cleanTag(tag).startsWith('chain:')) ? 16 : 0
  return Math.round(freshness + likeCount * 12 + bookmarkBoost * 10 + formatBoost + chainBoost)
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
  const prefix = meta.isQuickNote
    ? 'Quick note'
    : meta.isResponseEssay
    ? 'Response essay'
    : meta.isQuoteReact
    ? 'Quote react'
    : meta.isDrop
    ? 'Live drop'
    : 'ROST story'
  return `${prefix}: ${post.title}\n${meta.summary}`
}

export function createRostDigest(posts: Post[]) {
  const pulse = getTrendPulse(posts)
  const ranked = [...posts]
    .sort((a, b) => getStoryHeatScore(b) - getStoryHeatScore(a))
    .slice(0, 4)
  const topRoom = pulse.rooms[0]?.name ?? 'Open Room'
  const topTag = pulse.tags[0]?.name ?? 'new voices'
  const topChain = pulse.chains[0]?.name?.replace(/-/g, ' ') ?? 'start a response chain'

  return {
    headline: `${topRoom} is carrying the room right now`,
    subline: `Trending around #${topTag}. Next prompt: ${topChain}.`,
    topRoom,
    topTag,
    topChain,
    ranked
  }
}

export function getRoomProfiles(categories: string[], posts: Post[]) {
  return categories.map((category) => {
    const roomPosts = posts.filter((post) => post.category === category)
    const topTags = getTrendPulse(roomPosts).tags.slice(0, 3)
    return {
      name: category,
      postsCount: roomPosts.length,
      topTags,
      temperature: roomPosts.reduce((total, post) => total + getStoryHeatScore(post), 0)
    }
  }).sort((a, b) => b.temperature - a.temperature)
}

export function getReaderTaste(posts: Post[]) {
  const pulse = getTrendPulse(posts)
  const favoriteRoom = pulse.rooms[0]?.name ?? 'Still exploring'
  const favoriteTag = pulse.tags[0]?.name ?? 'fresh starts'
  const favoriteSeries = pulse.series[0]?.name?.replace(/-/g, ' ') ?? 'No series yet'
  return {
    title: favoriteRoom === 'Still exploring' ? 'New signal' : `${favoriteRoom} regular`,
    favoriteRoom,
    favoriteTag,
    favoriteSeries
  }
}
