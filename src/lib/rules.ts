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
