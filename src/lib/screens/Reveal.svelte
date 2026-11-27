<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import Eye from '@lucide/svelte/icons/eye'
  import { game } from '../game.svelte'
  import { getCategory } from '../words'
  import TopBar from '../TopBar.svelte'
  import CategoryIcon from '../CategoryIcon.svelte'

  let dialog = $state<HTMLDialogElement>()
  let selected = $state<string | null>(null)
  let peeking = $state(false)
  let hasPeeked = $state(false)

  const round = $derived(game.round!)
  const categoryName = $derived(getCategory(round.categoryId)?.name ?? 'Your words')
  const isImposter = $derived(selected !== null && game.isImposter(selected))
  const imposterCount = $derived(round.imposters.length)
  // Rounds saved before the option existed always showed the count.
  const countShown = $derived(round.countShown !== false)
  // Undercover slips look the same for everyone: impostors just get the decoy.
  const undercover = $derived(!!round.decoy)
  const slipWord = $derived(undercover && isImposter ? round.decoy : round.word)
  const showHint = $derived(
    selected !== null && game.hintsOn && game.hintAllowedFor(selected) && round.hint !== '',
  )
  const roundNote = $derived(undercover ? ', undercover' : game.hintsOn ? ', hints on' : '')
  const remaining = $derived(game.players.length - round.viewed.length)

  function openCard(player: string) {
    selected = player
    peeking = false
    hasPeeked = false
    dialog?.showModal()
  }

  function done() {
    if (selected) game.markViewed(selected)
    dialog?.close()
  }

  function startPeek() {
    peeking = true
    hasPeeked = true
  }

  function endPeek() {
    peeking = false
  }

  function onKeydown(event: KeyboardEvent) {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault()
      startPeek()
    }
  }

  function onKeyup(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') endPeek()
  }
</script>

<div class="screen">
  <TopBar />

  <div class="screen-body">
    <p class="category">
      <CategoryIcon id={round.categoryId} />
      {categoryName}
    </p>
    <h1 class="heading">Pass the phone around</h1>
    <p class="sub">
      Tap your name and hold to see your {undercover ? 'word' : 'role'}.
      {#if countShown}
        {imposterCount > 1 ? `${imposterCount} impostors` : 'One impostor'} this round{roundNote}.
      {:else}
        Impostor count is secret{roundNote}.
      {/if}
    </p>

    <div class="player-grid">
      {#each game.players as player (player)}
        {@const viewed = round.viewed.includes(player)}
        <button class="player-card" class:viewed onclick={() => openCard(player)}>
          <span class="name">{player}</span>
          <span class="status">
            {#if viewed}
              <Check size={16} strokeWidth={1.75} aria-hidden="true" />
              Seen
            {:else}
              Tap to see
            {/if}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <div class="screen-footer">
    <button class="btn btn-primary" disabled={!game.allViewed} onclick={() => game.startPlaying()}>
      {game.allViewed ? 'Start talking' : `${remaining} still to see`}
    </button>
  </div>
</div>

<dialog bind:this={dialog} aria-labelledby="reveal-title">
  <div class="dialog-card reveal-card">
    <h2 id="reveal-title">{selected}</h2>

    <button
      class="slip"
      class:peeking
      class:imposter={peeking && isImposter && !undercover}
      onpointerdown={startPeek}
      onpointerup={endPeek}
      onpointercancel={endPeek}
      onpointerleave={endPeek}
      onkeydown={onKeydown}
      onkeyup={onKeyup}
      oncontextmenu={(e) => e.preventDefault()}
      aria-live="polite"
    >
      {#if peeking}
        <span class="slip-category">{categoryName}</span>
        {#if undercover}
          <span class="role">{slipWord}</span>
          <span class="hint">Your word. Act natural</span>
        {:else if isImposter}
          <span class="role">{imposterCount > 1 || !countShown ? 'You’re an impostor' : 'You’re the impostor'}</span>
          {#if showHint}
            <span class="hint">Hint: {round.hint}</span>
          {:else}
            <span class="hint">No hint this round. Bluff hard</span>
          {/if}
        {:else}
          <span class="role">{round.word}</span>
          <span class="hint">The secret word. Act natural</span>
        {/if}
      {:else}
        <span class="peek-prompt">
          <Eye size={24} strokeWidth={1.5} aria-hidden="true" />
          Hold to reveal
        </span>
      {/if}
    </button>

    <div class="reveal-actions">
      <button class="btn btn-primary" disabled={!hasPeeked} onclick={done}>Got it, pass it on</button>
      <button class="btn btn-quiet" onclick={() => dialog?.close()}>Not me</button>
    </div>
  </div>
</dialog>

<style>
  .category {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-2);
    font-size: 0.9375rem;
  }

  .category :global(svg) {
    color: var(--muted);
  }

  .heading {
    font-size: 2rem;
    margin-top: 8px;
  }

  .sub {
    margin-top: 8px;
    color: var(--text-2);
  }

  /* -------------------------------- dialog ------------------------------- */

  .reveal-card {
    display: grid;
    gap: 20px;
    text-align: center;
  }

  .reveal-card h2 {
    font-size: 1.75rem;
    overflow-wrap: anywhere;
  }

  /* The folded slip of paper: dark until held, then the word in ink */
  .slip {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    min-height: 208px;
    border-radius: 12px;
    background: var(--bg);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    padding: 24px 20px;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    transition:
      background-color 160ms var(--ease),
      box-shadow 160ms var(--ease),
      transform 220ms var(--ease);
  }

  .slip.peeking {
    background: var(--paper);
    color: var(--ink);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
  }

  /* The odd one out: the slip tips like the wordmark's t */
  .slip.imposter {
    transform: rotate(-2deg);
  }

  .peek-prompt {
    display: grid;
    place-items: center;
    gap: 8px;
    color: var(--text-2);
    font-family: var(--font-display);
    font-size: 1.0625rem;
  }

  .slip-category {
    color: var(--ink-2);
    font-size: 0.8125rem;
  }

  .role {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 2.25rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .slip.imposter .role {
    color: var(--coral-ink);
  }

  .hint {
    color: var(--ink-2);
    font-size: 0.9375rem;
    text-wrap: pretty;
  }

  .reveal-actions {
    display: grid;
    gap: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .slip.imposter {
      transform: none;
    }
  }
</style>
