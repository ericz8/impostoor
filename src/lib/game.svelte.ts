import { flushSync } from 'svelte'
import { categories, type WordEntry } from './words'
import { pickMany, speaksEarly, voteOutcome, type VoteOutcome } from './rules'

export type Screen = 'intro' | 'setup' | 'reveal' | 'play' | 'vote'

export type Winner = 'imposter' | 'players'

export interface Vote {
  /** Who can be voted for; narrowed to the tied players on a revote. */
  candidates: string[]
  /** Secret ballots, voter -> pick. Never shown on screen. */
  ballots: Record<string, string>
  revote: boolean
  /** Set once the ballots are counted. */
  outcome?: VoteOutcome
}

export interface Round {
  word: string
  hint: string
  categoryId: string
  imposters: string[]
  starter: string
  /** Whether the final speaking order matches reveal order, or its reverse. */
  clockwise: boolean
  /** Speaking order for the round, starting with the starter. Set once everyone has revealed. */
  order: string[]
  viewed: string[]
  winner?: Winner | null
  /** Blind voting only. */
  vote?: Vote | null
}

interface SessionSnapshot {
  players: string[]
  selectedCategories: string[]
  hintsOn: boolean
  blindVoting?: boolean
  imposterCount?: number
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

/** Marks the single history entry pushed on top of setup for every other screen. */
const NAV_STATE = { impostoorSub: true }

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
  /** Players pass the phone to vote in secret instead of pointing. */
  blindVoting = $state(false)
  /** Requested impostor count; clamped to what the lineup allows. */
  imposterCount = $state(1)
  usedWords: string[] = $state([])
  round: Round | null = $state(null)
  recentPlayers: string[] = $state([])
  imposterWins = $state(0)
  playerWins = $state(0)
  customWords: WordEntry[] = $state([])
  /** True while a history entry for a non-setup screen sits on top of setup. */
  canGoBack = $state(false)
  /** Set when leaving would throw away a round some players already peeked at. */
  confirmLeave = $state(false)

  private forceLeave = false

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

  /** At least one player always shares the word. */
  readonly maxImposters = $derived(Math.max(1, this.players.length - 1))

  readonly effectiveImposters = $derived(
    Math.min(Math.max(1, this.imposterCount), this.maxImposters),
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
    this.customWords = readJSON<WordEntry[]>(localStorage, CUSTOM_KEY) ?? []

    const session = readJSON<SessionSnapshot>(sessionStorage, SESSION_KEY)
    if (session) {
      this.players = session.players
      this.selectedCategories = session.selectedCategories.filter(
        (id) => id === CUSTOM_ID || categories.some((c) => c.id === id),
      )
      this.hintsOn = session.hintsOn
      this.blindVoting = session.blindVoting ?? false
      this.imposterCount = session.imposterCount ?? 1
      this.usedWords = session.usedWords
      // Rounds saved before multi-impostor support have no `imposters` list.
      this.round = Array.isArray(session.round?.imposters) ? session.round : null
      this.imposterWins = session.imposterWins ?? 0
      this.playerWins = session.playerWins ?? 0
      // Never resume mid-reveal/mid-play after a reload; the round data is
      // kept so "used words" stay accurate, but the screen resets to setup.
      this.screen = 'setup'
    } else if (!localStorage.getItem(INTRO_KEY)) {
      this.screen = 'intro'
    }

    // A reload on a sub-screen leaves its history entry behind; drop it so the
    // next system back does not land on a dead entry.
    if ((history.state as typeof NAV_STATE | null)?.impostoorSub) history.back()
    window.addEventListener('popstate', () => this.onPopState())
  }

  persist() {
    const snapshot: SessionSnapshot = {
      players: this.players,
      selectedCategories: this.selectedCategories,
      hintsOn: this.hintsOn,
      blindVoting: this.blindVoting,
      imposterCount: this.imposterCount,
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
    if (this.canGoBack) this.back()
    else this.show('setup')
  }

  // ------------------------------- navigation -------------------------------

  /** Move forward to a screen. Every non-setup screen shares one history entry above setup. */
  go(screen: Exclude<Screen, 'setup'>) {
    if (this.canGoBack) {
      history.replaceState(NAV_STATE, '')
    } else {
      history.pushState(NAV_STATE, '')
      this.canGoBack = true
    }
    this.show(screen, 'forward')
  }

  /** On-screen back: same path as the system back gesture. */
  back() {
    if (this.screen === 'vote') {
      this.show('play', 'backward')
      return
    }
    if (this.needsLeaveConfirm()) {
      this.confirmLeave = true
      return
    }
    this.leave()
  }

  leaveConfirmed() {
    this.confirmLeave = false
    this.forceLeave = true
    this.leave()
  }

  private needsLeaveConfirm() {
    return this.screen === 'reveal' && (this.round?.viewed.length ?? 0) > 0
  }

  private leave() {
    if (this.canGoBack) history.back()
    else this.returnToSetup()
  }

  private onPopState() {
    if (!this.canGoBack) return
    this.canGoBack = false
    if (this.screen === 'setup') return
    if (this.screen === 'vote') {
      // Back from the vote lands on play, not setup: re-arm the entry.
      history.pushState(NAV_STATE, '')
      this.canGoBack = true
      this.show('play', 'backward')
      return
    }
    if (!this.forceLeave && this.needsLeaveConfirm()) {
      // Re-arm the entry the gesture just consumed and ask first.
      history.pushState(NAV_STATE, '')
      this.canGoBack = true
      this.confirmLeave = true
      return
    }
    this.forceLeave = false
    this.returnToSetup()
  }

  private returnToSetup() {
    if (this.screen === 'reveal') this.cancelRound()
    this.show('setup', 'backward')
  }

  /** Switch screens with a directional view transition when supported. */
  private show(screen: Screen, direction: 'forward' | 'backward' = 'forward') {
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

  // --------------------------------- players --------------------------------

  addPlayer(rawName: string): string | null {
    const name = rawName.trim().replace(/\s+/g, ' ')
    if (!name) return 'Enter a name first'
    if (name.length > 20) return 'Keep names under 20 characters'
    if (this.players.some((p) => p.toLowerCase() === name.toLowerCase())) {
      return `${name} is already playing`
    }
    this.players.push(name)
    this.rememberPlayer(name)
    return null
  }

  removePlayer(name: string) {
    this.players = this.players.filter((p) => p !== name)
  }

  /** Remove a saved player; returns their slot so the removal can be undone. */
  forgetRecentPlayer(name: string): number {
    const index = this.recentPlayers.indexOf(name)
    if (index !== -1) this.recentPlayers.splice(index, 1)
    return index
  }

  restoreRecentPlayer(name: string, index: number) {
    if (this.recentPlayers.includes(name)) return
    this.recentPlayers.splice(Math.max(0, index), 0, name)
    this.recentPlayers = this.recentPlayers.slice(0, MAX_RECENT)
  }

  private rememberPlayer(name: string) {
    this.recentPlayers = [
      name,
      ...this.recentPlayers.filter((p) => p.toLowerCase() !== name.toLowerCase()),
    ].slice(0, MAX_RECENT)
  }

  setImposterCount(count: number) {
    this.imposterCount = Math.min(Math.max(1, count), this.maxImposters)
  }

  // ------------------------------- categories -------------------------------

  /** Built-in categories, plus "Your words" once it has entries. */
  readonly selectableCategories = $derived([
    ...categories.map((c) => c.id),
    ...(this.customWords.length > 0 ? [CUSTOM_ID] : []),
  ])

  readonly allCategoriesSelected = $derived(
    this.selectableCategories.every((id) => this.selectedCategories.includes(id)),
  )

  toggleAllCategories() {
    this.selectedCategories = this.allCategoriesSelected ? [] : [...this.selectableCategories]
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
    if (!word) return 'Enter a word first'
    if (word.length > 40) return 'Keep words under 40 characters'
    if (this.customWords.some((w) => w.word.toLowerCase() === word.toLowerCase())) {
      return `“${word}” is already on your list`
    }
    this.customWords.push({ word, hint })
    return null
  }

  removeCustomWord(word: string) {
    this.customWords = this.customWords.filter((w) => w.word !== word)
  }

  // ---------------------------------- rounds --------------------------------

  startGame() {
    if (!this.canStart) return

    const pool = this.wordPool

    // Avoid words already used this session, if any are left.
    const fresh = pool.filter(({ entry }) => !this.usedWords.includes(entry.word))
    const { entry, categoryId } = pick(fresh.length > 0 ? fresh : pool)

    const imposters = pickMany(this.players, this.effectiveImposters)
    // Speaking order is set once everyone reveals: the phone gets passed
    // clockwise around the circle, so reveal order (or its reverse) *is*
    // the real seating order.
    const clockwise = Math.random() < 0.5

    this.usedWords.push(entry.word)
    this.round = {
      word: entry.word,
      hint: entry.hint,
      categoryId,
      imposters,
      starter: '',
      clockwise,
      order: [],
      viewed: [],
    }
    this.go('reveal')
  }

  /** Leaving reveal abandons the round. An unseen word goes back in the pool. */
  private cancelRound() {
    const round = this.round
    if (!round) return
    if (round.viewed.length === 0) {
      this.usedWords = this.usedWords.filter((w) => w !== round.word)
    }
  }

  isImposter(player: string) {
    return this.round?.imposters.includes(player) ?? false
  }

  hintAllowedFor(player: string) {
    if (!this.round) return false
    const { viewed, clockwise } = this.round
    return speaksEarly(player, viewed, clockwise, this.players.length)
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

  // ---------------------------------- voting --------------------------------

  /** The counted vote once it is settled (someone out, or nobody); null while pending or tied. */
  readonly voteResult = $derived.by(() => {
    const outcome = this.round?.vote?.outcome
    return outcome && outcome.kind !== 'tie' ? outcome : null
  })

  /** Start a fresh secret vote. Any half-finished one is thrown away. */
  startVote() {
    if (!this.round || this.voteResult) return
    this.round.vote = { candidates: [...this.round.order], ballots: {}, revote: false }
    this.go('vote')
  }

  castVote(voter: string, pick: string) {
    const vote = this.round?.vote
    if (!vote || vote.outcome || voter === pick || !vote.candidates.includes(pick)) return
    vote.ballots[voter] = pick
  }

  countVotes() {
    const vote = this.round?.vote
    if (!vote || Object.keys(vote.ballots).length < this.players.length) return
    vote.outcome = voteOutcome(vote.ballots, vote.revote)
  }

  revote() {
    const vote = this.round?.vote
    if (!this.round || vote?.outcome?.kind !== 'tie') return
    this.round.vote = { candidates: vote.outcome.tied, ballots: {}, revote: true }
  }

  playAgain() {
    // The stale round is left in place (startGame replaces it). Nulling it
    // here would crash the still-mounted Play screen's derived reads.
    this.back()
  }
}

export const game = new GameState()
