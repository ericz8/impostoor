# Impostoor

A mobile-first, pass-the-phone party game PWA. Everyone gets the secret word — except the impostor, who has to blend in on a vague hint (or nothing at all).

Built with Svelte 5 (runes), Vite, and `vite-plugin-pwa`. Fully installable and playable offline.

## How a round works

1. **Set up**: pick word categories (13 built in, 40 words each, plus your own), choose how many impostors (up to one fewer than the player count) and whether to say how many, toggle the impostor hint, undercover mode and blind voting, add 3+ players. Saved players from earlier sessions are one tap away. Long press (touch) or right-click (mouse) a saved player to forget them, with undo.
2. **Pass the phone**: each player taps their name and *holds to peek* at their role. Crew members see the secret word and its category. Impostors see the category and a hint, but only if they're one of the first two speakers (a late impostor has already heard clues).
3. **Play**: the app shows the category, who starts, the direction around the circle, and the full speaking order. Go around giving one word or phrase each, then vote. An optional discussion timer (1, 2, 3 or 5 minutes) vibrates at zero where the device supports it.
4. **Blind voting** (optional): instead of pointing, tap "Start the vote" and pass the phone again. Each player taps their name and secretly picks someone other than themselves. The most-voted player is out, and the app shows whether they were an impostor. A tie gets one revote between the tied players, and a second tie means nobody goes out. Continue returns to the play screen to record the winner.

**Undercover mode** replaces the hint: impostors get a close decoy word (Hologram vs Projector, Lion vs Tiger) and the reveal looks the same for everyone, so nobody knows their own role. Every built-in word has a curated decoy. Custom words can have one too. A custom word without a decoy is swapped for one from the same category that has one, and if there is none the round falls back to normal hint mode. The hint switch dims while undercover is on, unless the selected words include one without a decoy.

Every screen past setup has a back arrow that also follows the system back gesture. Leaving a round after someone has peeked asks for confirmation first.

Win conditions: the crew wins by voting out the impostor — unless the impostor then guesses the word. The impostor also wins by surviving the vote. The play screen has a spoiler-safe "reveal the secret word" for checking guesses, which shows both words in an undercover round.

## Development

Uses [bun](https://bun.sh):

```sh
bun install
bun run dev       # dev server (no service worker)
bun run check     # svelte-check + tsc
bun run build     # production build incl. service worker + manifest
bun run preview   # serve the production build (PWA testable here)
```

App icons are generated from the bean in `scripts/make-icons.ts`:

```sh
bun run scripts/make-icons.ts
```

## Storage model

- **`sessionStorage`**: the per-tab session with players, selected categories, hint, undercover, blind-voting and count-shown toggles, timer length, impostor count, words already used this session, and the impostor-vs-crew win tally.
- **`localStorage`** — cross-session: recently used player names (quick-add), custom words ("Your words" category), and the "seen intro" flag.

Word lists with per-word impostor hints and undercover decoys live in `src/lib/words.ts`. Word choice and decoy fallback live in `src/lib/rules.ts`, countdown math in `src/lib/timer.ts`.
