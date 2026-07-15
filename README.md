# Impostoor

A mobile-first, pass-the-phone party game PWA. Everyone gets the secret word — except the impostor, who has to blend in on a vague hint (or nothing at all).

Built with Svelte 5 (runes), Vite, and `vite-plugin-pwa`. Fully installable and playable offline.

## How a round works

1. **Set up** — pick word categories, toggle the impostor hint, add 3+ players. Players from earlier sessions are one tap away.
2. **Pass the phone** — each player taps their name and *holds to peek* at their role. Crew members see the secret word; the impostor sees a hint — but only if they're one of the first two speakers (a late impostor has already heard clues).
3. **Play** — the app fixes the speaking order up front (random starter, random direction around the circle) and shows it as a numbered list. Go around giving one word or phrase each, then vote.

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

- **`sessionStorage`** — the per-tab session: players, selected categories, hint toggle, words already used this session, and the impostor-vs-players win tally.
- **`localStorage`** — cross-session: recently used player names (quick-add), custom words ("Your words" category), and the "seen intro" flag.

Word lists with per-word impostor hints live in `src/lib/words.ts`.
