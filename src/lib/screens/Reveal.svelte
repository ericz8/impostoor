<script lang="ts">
  import { game } from '../game.svelte'
  import { getCategory } from '../words'

  let dialog = $state<HTMLDialogElement>()
  let selected = $state<string | null>(null)
  let peeking = $state(false)
  let hasPeeked = $state(false)

  const round = $derived(game.round!)
  const category = $derived(getCategory(round.categoryId))
  const categoryLabel = $derived(
    category ? `${category.emoji} ${category.name}` : '✏️ Your words',
  )
  const isImposter = $derived(selected === round.imposter)

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
  <div class="screen-body">
    <p class="eyebrow">
      {categoryLabel} · {game.hintsOn ? 'hints on' : 'hints off'}
    </p>
    <h1 class="heading">Pass the phone around</h1>
    <p class="sub">Tap your name, peek at your role, keep your poker face.</p>

    <div class="player-grid">
      {#each game.players as player (player)}
        {@const viewed = round.viewed.includes(player)}
        <button class="player-card" class:viewed onclick={() => openCard(player)}>
          <span class="name">{player}</span>
          <span class="status">
            {#if viewed}
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="m5 13 4 4L19 7"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              seen
            {:else}
              tap to peek
            {/if}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <div class="screen-footer">
    <button
      class="btn btn-primary"
      disabled={!game.allViewed}
      onclick={() => game.startPlaying()}
    >
      {game.allViewed
        ? 'Everyone’s in — start talking'
        : `${round.viewed.length}/${game.players.length} have peeked`}
    </button>
  </div>
</div>

<dialog bind:this={dialog} aria-labelledby="reveal-title">
  <div class="dialog-card reveal-card">
    <p class="eyebrow">For your eyes only</p>
    <h2 id="reveal-title">{selected}</h2>

    <button
      class="peek-zone"
      class:peeking
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
        {#if isImposter}
          <span class="role imposter">You’re the impostor</span>
          {#if game.hintsOn && round.hintAllowed && round.hint}
            <span class="hint">Hint: {round.hint}</span>
          {:else}
            <span class="hint">No hint this round. Bluff hard.</span>
          {/if}
        {:else}
          <span class="role word">{round.word}</span>
          <span class="hint">That’s the secret word. Act natural.</span>
        {/if}
      {:else}
        <span class="peek-prompt">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path
              d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          Hold to reveal
        </span>
      {/if}
    </button>

    <button class="btn btn-primary done" disabled={!hasPeeked} onclick={done}>
      Got it — pass it on
    </button>
    <button class="btn btn-quiet" onclick={() => dialog?.close()}>
      Wait, that’s not me
    </button>
  </div>
</dialog>

<style>
  .heading {
    font-size: 1.9rem;
    margin: 0.4rem 0 0.3rem;
  }

  .sub {
    color: var(--muted);
    margin-bottom: 1.4rem;
  }

  .player-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .player-card {
    display: grid;
    gap: 0.25rem;
    text-align: left;
    background: var(--bg-raised);
    border: 1.5px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 1rem 1.1rem;
    transition:
      border-color 0.15s ease,
      opacity 0.15s ease,
      transform 0.12s ease;
  }

  .player-card:active {
    transform: scale(0.97);
  }

  .player-card .name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.15rem;
    overflow-wrap: anywhere;
  }

  .player-card .status {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .player-card.viewed {
    opacity: 0.55;
    border-style: dashed;
  }

  .player-card.viewed .status {
    color: var(--teal);
  }

  .reveal-card {
    display: grid;
    gap: 0.9rem;
    text-align: center;
  }

  .reveal-card h2 {
    font-size: 2rem;
    overflow-wrap: anywhere;
  }

  .peek-zone {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.5rem;
    min-height: 11rem;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 2px dashed color-mix(in oklab, var(--gold) 45%, transparent);
    padding: 1.2rem;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .peek-zone.peeking {
    background: var(--surface-2);
    border-color: transparent;
    border-style: solid;
  }

  .peek-prompt {
    display: grid;
    place-items: center;
    gap: 0.4rem;
    color: var(--gold);
    font-family: var(--font-display);
    font-weight: 650;
    font-size: 1.05rem;
  }

  .role {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.9rem;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  .role.imposter {
    color: var(--coral);
  }

  .role.word {
    color: var(--teal);
  }

  .hint {
    color: var(--muted);
    font-size: 0.95rem;
    text-wrap: pretty;
  }

  .done:disabled {
    opacity: 0.7;
  }
</style>
