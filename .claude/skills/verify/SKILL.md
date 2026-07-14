---
name: verify
description: Build, run, and drive Impostoor (Svelte 5 PWA) end-to-end at a mobile viewport.
---

# Verifying Impostoor

Toolchain is **bun** (not node): `export PATH="$HOME/.bun/bin:$PATH"` first — node is not on PATH in non-interactive shells.

## Build & serve

```sh
bun run build                  # also generates sw.js + manifest via vite-plugin-pwa
bun run preview --port 4173 &  # service worker only works against the built app
```

## Drive it

Playwright is installed in `$CLAUDE_JOB_DIR/tmp` style scratch dirs, with headless-shell chromium in `~/.cache/ms-playwright` (`bunx playwright install chromium` — skip `--with-deps`, sudo is unavailable). Launch a context with `viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true`.

Flows worth driving:

- Intro (fresh profile) → "Set up a game" → add 3 players → Start round.
- Reveal: tap a `.player-card`, then `dispatchEvent('pointerdown')` on `dialog[open] .peek-zone` to peek (role appears in `.role`), `pointerup` to hide, click "Got it — pass it on". Exactly one player across the lineup should see "You're the impostor".
- Play: `.starter-name` must be one of the players; "Reveal the secret word" must match what crew members saw.
- Persistence: reload → back on setup with players/categories kept; a **new page in the same context** (fresh sessionStorage) → empty lineup but `.recent-chip` quick-add buttons present.
- Offline: after `navigator.serviceWorker.ready`, `context.setOffline(true)` + reload must still render.

## Gotchas

- Screenshots race the dialog entry animation and view transitions — wait ~500ms after opening dialogs / switching screens or shots capture half-faded UI.
- Category emoji render as tofu in headless chromium (no emoji fonts installed); not an app bug.
- Collect `page.on('pageerror')` — a past regression (nulling `game.round` while Play screen was mounted) only surfaced there.
