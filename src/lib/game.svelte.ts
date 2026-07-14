import { flushSync } from 'svelte'
import { categories, type WordEntry } from './words'

export type Screen = 'intro' | 'setup' | 'reveal' | 'play'

export type Winner = 'imposter' | 'players'

export interface Round {
  word: string
  hint: string
  categoryId: string
  imposter: string
  starter: string
  clockwise: boolean
  viewed: string[]
  winner?: Winner | null
}

interface SessionSnapshot {
  players: string[]
  selectedCategories: string[]
  hintsOn: boolean
  usedWords: string[]
  round: Round | null
  screen: Screen
  imposterWins?: number
  playerWins?: number
}

const SESSION_KEY = 'impostoor:session'
const RECENT_KEY = 'impostoor:recent-players'
const INTRO_KEY = 'impostoor:seen-intro'
const MAX_RECENT = 12

export const MIN_PLAYERS = 3

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function readJSON<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

class GameState {
  screen: Screen = $state('setup')
  players: string[] = $state([])
  selectedCategories: string[] = $state(['animals'])
  hintsOn = $state(true)
  usedWords: string[] = $state([])
  round: Round | null = $state(null)
  recentPlayers: string[] = $state([])
  imposterWins = $state(0)
  playerWins = $state(0)

  readonly canStart = $derived(
    this.players.length >= MIN_PLAYERS && this.selectedCategories.length >= 1,
  )

  /** Recent players not already in the current lineup. */
  readonly quickAddPlayers = $derived(
    this.recentPlayers.filter(
      (name) => !this.players.some((p) => p.toLowerCase() === name.toLowerCase()),
    ),
  )

  readonly allViewed = $derived(
    this.round !== null && this.round.viewed.length === this.players.length,
  )

  constructor() {
    this.recentPlayers = readJSON<string[]>(localStorage, RECENT_KEY) ?? []

    const session = readJSON<SessionSnapshot>(sessionStorage, SESSION_KEY)
    if (session) {
      this.players = session.players
      this.selectedCategories = session.selectedCategories.filter((id) =>
        categories.some((c) => c.id === id),
      )
      if (this.selectedCategories.length === 0) this.selectedCategories = ['animals']
      this.hintsOn = session.hintsOn
      this.usedWords = session.usedWords
      this.round = session.round
      this.imposterWins = session.imposterWins ?? 0
      this.playerWins = session.playerWins ?? 0
      // Never resume mid-reveal/mid-play after a reload; the round data is
      // kept so "used words" stay accurate, but the screen resets to setup.
      this.screen = 'setup'
    } else if (!localStorage.getItem(INTRO_KEY)) {
      this.screen = 'intro'
    }
  }

  persist() {
    const snapshot: SessionSnapshot = {
      players: this.players,
      selectedCategories: this.selectedCategories,
      hintsOn: this.hintsOn,
      usedWords: this.usedWords,
      round: this.round,
      screen: this.screen,
      imposterWins: this.imposterWins,
      playerWins: this.playerWins,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
    localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentPlayers))
  }

  finishIntro() {
    localStorage.setItem(INTRO_KEY, '1')
    this.go('setup')
  }

  /** Switch screens with a directional view transition when supported. */
  go(screen: Screen, direction: 'forward' | 'backward' = 'forward') {
    const update = () => flushSync(() => (this.screen = screen))
    if (!document.startViewTransition) {
      update()
      return
    }
    document.documentElement.dataset.navDir = direction
    const transition = document.startViewTransition(update)
    transition.finished.finally(() => {
      delete document.documentElement.dataset.navDir
    })
  }

  addPlayer(rawName: string): string | null {
    const name = rawName.trim().replace(/\s+/g, ' ')
    if (!name) return 'Enter a name first.'
    if (name.length > 20) return 'Keep names under 20 characters.'
    if (this.players.some((p) => p.toLowerCase() === name.toLowerCase())) {
      return `${name} is already playing.`
    }
    this.players.push(name)
    this.rememberPlayer(name)
    return null
  }

  removePlayer(name: string) {
    this.players = this.players.filter((p) => p !== name)
  }

  forgetRecentPlayer(name: string) {
    this.recentPlayers = this.recentPlayers.filter((p) => p !== name)
  }

  private rememberPlayer(name: string) {
    this.recentPlayers = [
      name,
      ...this.recentPlayers.filter((p) => p.toLowerCase() !== name.toLowerCase()),
    ].slice(0, MAX_RECENT)
  }

  toggleCategory(id: string) {
    if (this.selectedCategories.includes(id)) {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== id)
    } else {
      this.selectedCategories.push(id)
    }
  }

  startGame() {
    if (!this.canStart) return

    const pool: { entry: WordEntry; categoryId: string }[] = categories
      .filter((c) => this.selectedCategories.includes(c.id))
      .flatMap((c) => c.words.map((entry) => ({ entry, categoryId: c.id })))

    // Avoid words already used this session, if any are left.
    const fresh = pool.filter(({ entry }) => !this.usedWords.includes(entry.word))
    const { entry, categoryId } = pick(fresh.length > 0 ? fresh : pool)

    this.usedWords.push(entry.word)
    this.round = {
      word: entry.word,
      hint: entry.hint,
      categoryId,
      imposter: pick(this.players),
      starter: pick(this.players),
      clockwise: Math.random() < 0.5,
      viewed: [],
    }
    this.go('reveal')
  }

  markViewed(player: string) {
    if (this.round && !this.round.viewed.includes(player)) {
      this.round.viewed.push(player)
    }
  }

  startPlaying() {
    if (this.allViewed) this.go('play')
  }

  /** Record who won the current round; tapping again switches the pick. */
  setWinner(winner: Winner) {
    if (!this.round || this.round.winner === winner) return
    if (this.round.winner === 'imposter') this.imposterWins--
    if (this.round.winner === 'players') this.playerWins--
    if (winner === 'imposter') this.imposterWins++
    else this.playerWins++
    this.round.winner = winner
  }

  playAgain() {
    // The stale round is left in place (startGame replaces it) — nulling it
    // here would crash the still-mounted Play screen's derived reads.
    this.go('setup', 'backward')
  }
}

export const game = new GameState()
