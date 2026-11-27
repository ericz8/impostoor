import { expect, test } from 'bun:test'
import { countdown, formatClock, pauseCountdown, remainingMs, startCountdown } from './timer'

test('countdown runs, pauses, resumes and clamps at zero', () => {
  let c = countdown(120_000)
  expect(remainingMs(c, 1_000)).toBe(120_000)

  c = startCountdown(c, 1_000)
  expect(remainingMs(c, 31_000)).toBe(90_000)
  // Starting again while running keeps the original start.
  expect(startCountdown(c, 20_000)).toBe(c)

  c = pauseCountdown(c, 31_000)
  expect(remainingMs(c, 500_000)).toBe(90_000)

  c = startCountdown(c, 600_000)
  expect(remainingMs(c, 660_000)).toBe(30_000)
  expect(remainingMs(c, 900_000)).toBe(0)

  c = pauseCountdown(c, 900_000)
  // A finished countdown cannot be restarted without a reset.
  expect(startCountdown(c, 901_000).startedAt).toBeNull()
})

test.each([
  [120_000, '2:00'],
  [119_001, '2:00'],
  [119_000, '1:59'],
  [61_000, '1:01'],
  [999, '0:01'],
  [0, '0:00'],
  [-50, '0:00'],
])('formatClock(%d) is %s', (ms, expected) => {
  expect(formatClock(ms)).toBe(expected)
})
