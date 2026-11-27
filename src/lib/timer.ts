/** A pausable countdown, stored as timestamps so it survives throttled ticks. */
export interface Countdown {
  durationMs: number
  /** When the current run started, or null while paused or idle. */
  startedAt: number | null
  /** Time already counted down in earlier runs. */
  bankedMs: number
}

export function countdown(durationMs: number): Countdown {
  return { durationMs, startedAt: null, bankedMs: 0 }
}

export function remainingMs(c: Countdown, now: number): number {
  const elapsed = c.bankedMs + (c.startedAt === null ? 0 : now - c.startedAt)
  return Math.max(0, c.durationMs - elapsed)
}

export function startCountdown(c: Countdown, now: number): Countdown {
  if (c.startedAt !== null || remainingMs(c, now) === 0) return c
  return { ...c, startedAt: now }
}

export function pauseCountdown(c: Countdown, now: number): Countdown {
  if (c.startedAt === null) return c
  return { ...c, startedAt: null, bankedMs: c.durationMs - remainingMs(c, now) }
}

/** m:ss, rounded up so the clock only reads 0:00 once time is actually out. */
export function formatClock(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
