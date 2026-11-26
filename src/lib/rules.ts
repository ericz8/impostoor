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
