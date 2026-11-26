import { describe, expect, test } from 'bun:test'
import { pickMany, speaksEarly } from './rules'

describe('speaksEarly', () => {
  // 5 players; `viewed` is who revealed before (or including) the player.
  test.each([
    ['first to reveal, clockwise', 'A', [], true, true],
    ['second to reveal, clockwise', 'B', ['A'], true, true],
    ['third to reveal, clockwise', 'C', ['A', 'B'], true, false],
    ['already revealed third, clockwise', 'C', ['A', 'B', 'C', 'D'], true, false],
    ['first to reveal, counter-clockwise speaks last', 'A', [], false, false],
    ['fourth to reveal, counter-clockwise speaks second', 'D', ['A', 'B', 'C'], false, true],
    ['last to reveal, counter-clockwise speaks first', 'E', ['A', 'B', 'C', 'D'], false, true],
  ] as const)('%s', (_, player, viewed, clockwise, expected) => {
    expect(speaksEarly(player, [...viewed], clockwise, 5)).toBe(expected)
  })
})

test('pickMany returns distinct items from the input', () => {
  const players = ['A', 'B', 'C', 'D', 'E']
  for (let i = 0; i < 200; i++) {
    const picked = pickMany(players, 3)
    expect(new Set(picked).size).toBe(3)
    expect(picked.every((p) => players.includes(p))).toBe(true)
  }
  expect(pickMany(players, 9)).toHaveLength(5)
})
