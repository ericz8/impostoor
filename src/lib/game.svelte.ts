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
  /** Whether the final speaking order matches reveal order, or its reverse. */
  clockwise: boolean
  /** Speaking order for the round, starting with the starter. Set once everyone has revealed. */
  order: string[]
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
const CUSTOM_KEY = 'impostoor:custom-words'
const MAX_RECENT = 12

/** Pseudo-category id for user-authored words. */
export const CUSTOM_ID = 'custom'

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
  /** Empty means "all built-in categories". */
  selectedCategories: string[] = $state([])
  hintsOn = $state(true)
  usedWords: string[] = $state([])
  round: Round | null = $state(null)
  recentPlayers: string[] = $state([])
  imposterWins = $state(0)
  playerWins = $state(0)
  customWords: WordEntry[] = $state([])

  /** Every word the selected categories (incl. custom) contribute. Empty selection = all built-ins. */
  readonly wordPool = $derived.by(() => {
    const picked =
      this.selectedCategories.length === 0
        ? categories
        : categories.filter((c) => this.selectedCategories.includes(c.id))
    const pool = picked.flatMap((c) => c.words.map((entry) => ({ entry, categoryId: c.id })))
    if (this.selectedCategories.includes(CUSTOM_ID)) {
      pool.push(...this.customWords.map((entry) => ({ entry, categoryId: CUSTOM_ID })))
    }
    return pool
  })

  readonly canStart = $derived(this.players.length >= MIN_PLAYERS && this.wordPool.length > 0)

  /** Recent players not already in the current lineup. */
  readonly quickAddPlayers = $derived(
    this.recentPlayers.filter(
      (name) => !this.players.some((p) => p.toLowerCase() === name.toLowerCase()),
    ),
  )

  readonly allViewed = $derived(
    this.round !== null && this.round.viewed.length === this.players.length,
  )

  /** Hints are only granted when the imposter speaks first or second. */
  readonly hintAllowed = $derived.by(() => {
    if (!this.round) return false
    const { viewed, imposter, clockwise } = this.round
    const idx = viewed.includes(imposter) ? viewed.indexOf(imposter) : viewed.length
    const position = clockwise ? idx : this.players.length - 1 - idx
    return position <= 1
  })

  constructor() {
    this.recentPlayers = readJSON<string[]>(localStorage, RECENT_KEY) ?? []
    this.customWords = readJSON<WordEntry[]>(localStorage, CUSTOM_KEY) ?? []

    const session = readJSON<SessionSnapshot>(sessionStorage, SESSION_KEY)
    if (session) {
      this.players = session.players
      this.selectedCategories = session.selectedCategories.filter(
        (id) => id === CUSTOM_ID || categories.some((c) => c.id === id),
      )
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
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(this.customWords))
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

  addCustomWord(rawWord: string, rawHint: string): string | null {
    const word = rawWord.trim().replace(/\s+/g, ' ')
    const hint = rawHint.trim()
    if (!word) return 'Enter a word first.'
    if (word.length > 40) return 'Keep words under 40 characters.'
    if (this.customWords.some((w) => w.word.toLowerCase() === word.toLowerCase())) {
      return `“${word}” is already on your list.`
    }
    this.customWords.push({ word, hint })
    return null
  }

  removeCustomWord(word: string) {
    this.customWords = this.customWords.filter((w) => w.word !== word)
  }

  startGame() {
    if (!this.canStart) return

    const pool = this.wordPool

    // Avoid words already used this session, if any are left.
    const fresh = pool.filter(({ entry }) => !this.usedWords.includes(entry.word))
    const { entry, categoryId } = pick(fresh.length > 0 ? fresh : pool)

    const imposter = pick(this.players)
    // Speaking order is set once everyone reveals: the phone gets passed
    // clockwise around the circle, so reveal order (or its reverse) *is*
    // the real seating order.
    const clockwise = Math.random() < 0.5

    this.usedWords.push(entry.word)
    this.round = {
      word: entry.word,
      hint: entry.hint,
      categoryId,
      imposter,
      starter: '',
      clockwise,
      order: [],
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
    if (!this.allViewed || !this.round) return
    const { viewed, clockwise } = this.round
    this.round.order = clockwise ? [...viewed] : [...viewed].reverse()
    this.round.starter = this.round.order[0]
    this.go('play')
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
