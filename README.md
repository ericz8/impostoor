# Impostoor

A mobile-first, pass-the-phone party game PWA. Everyone gets the secret word — except the impostor, who has to blend in on a vague hint (or nothing at all).

Built with Svelte 5 (runes), Vite, and `vite-plugin-pwa`. Fully installable and playable offline.

## How a round works

1. **Set up**: pick word categories (13 built in, 40 words each, plus your own), choose how many impostors (up to one fewer than the player count), toggle the impostor hint, add 3+ players. Saved players from earlier sessions are one tap away. Long press (touch) or right-click (mouse) a saved player to forget them, with undo.
2. **Pass the phone**: each player taps their name and *holds to peek* at their role. Crew members see the secret word and its category. Impostors see the category and a hint, but only if they're one of the first two speakers (a late impostor has already heard clues).
3. **Play**: the app shows the category, who starts, the direction around the circle, and the full speaking order. Go around giving one word or phrase each, then vote.

Every screen past setup has a back arrow that also follows the system back gesture. Leaving a round after someone has peeked asks for confirmation first.

Win conditions: the crew wins by voting out the impostor — unless the impostor then guesses the word. The impostor also wins by surviving the vote. The play screen has a spoiler-safe "reveal the secret word" for checking guesses.

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

- **`sessionStorage`**: the per-tab session with players, selected categories, hint toggle, impostor count, words already used this session, and the impostor-vs-crew win tally.
- **`localStorage`** — cross-session: recently used player names (quick-add), custom words ("Your words" category), and the "seen intro" flag.

Word lists with per-word impostor hints live in `src/lib/words.ts`.
