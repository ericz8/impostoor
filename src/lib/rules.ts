import type { WordEntry } from './words'

/** `count` distinct random items. */
export function pickMany<T>(items: T[], count: number): T[] {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

/**
 * Hints only go to an impostor who speaks first or second. Speaking order is
 * reveal order (clockwise) or its reverse, so a player who has not revealed
 * yet is treated as the next one to reveal.
 */
export function speaksEarly(
  player: string,
  viewed: string[],
  clockwise: boolean,
  playerCount: number,
): boolean {
  const idx = viewed.includes(player) ? viewed.indexOf(player) : viewed.length
  const position = clockwise ? idx : playerCount - 1 - idx
  return position <= 1
}

export type VoteOutcome =
  | { kind: 'out'; player: string; votes: number }
  | { kind: 'tie'; tied: string[] }
  | { kind: 'none' }

/**
 * Count secret ballots (voter -> pick). The most-voted player is out. A tie
 * earns one revote between the tied players; a tie on the revote means
 * nobody goes out.
 */
export function voteOutcome(ballots: Record<string, string>, isRevote: boolean): VoteOutcome {
  const counts = new Map<string, number>()
  for (const [voter, pick] of Object.entries(ballots)) {
    if (voter !== pick) counts.set(pick, (counts.get(pick) ?? 0) + 1)
  }
  const top = Math.max(0, ...counts.values())
  const leaders = [...counts].filter(([, n]) => n === top && n > 0).map(([player]) => player)
  if (leaders.length === 1) return { kind: 'out', player: leaders[0], votes: top }
  if (leaders.length > 1 && !isRevote) return { kind: 'tie', tied: leaders }
  return { kind: 'none' }
}

export interface PoolEntry {
  entry: WordEntry
  categoryId: string
}

export interface WordChoice extends PoolEntry {
  /** Set only for an undercover round: the word every impostor sees instead. */
  decoy: string | null
}

/** A decoy only counts if it names something other than the word itself. */
export function usableDecoy(entry: WordEntry): string | null {
  const decoy = entry.decoy?.trim()
  if (!decoy || decoy.toLowerCase() === entry.word.trim().toLowerCase()) return null
  return decoy
}

/**
 * Picks the round's word, preferring words not used yet this session. In
 * undercover mode a word without a decoy is swapped for a fresh one from the
 * same category that has one. When the category has none (typically custom
 * words), the round falls back to normal hint mode.
 */
export function chooseWord(
  pool: PoolEntry[],
  usedWords: string[],
  undercover: boolean,
  random: () => number = Math.random,
): WordChoice {
  const pickOne = <T>(items: T[]): T => items[Math.floor(random() * items.length)]
  const fresh = pool.filter(({ entry }) => !usedWords.includes(entry.word))
  const candidates = fresh.length > 0 ? fresh : pool
  const choice = pickOne(candidates)
  if (!undercover) return { ...choice, decoy: null }

  const decoy = usableDecoy(choice.entry)
  if (decoy) return { ...choice, decoy }

  const swaps = candidates.filter(
    (c) => c.categoryId === choice.categoryId && usableDecoy(c.entry) !== null,
  )
  if (swaps.length === 0) return { ...choice, decoy: null }
  const swap = pickOne(swaps)
  return { ...swap, decoy: usableDecoy(swap.entry) }
}
