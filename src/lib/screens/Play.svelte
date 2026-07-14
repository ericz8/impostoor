<script lang="ts">
  import { game } from '../game.svelte'
  import Scoreboard from '../Scoreboard.svelte'

  const round = $derived(game.round!)

  let wordShown = $state(false)
</script>

<div class="screen">
  <div class="screen-body sections">
    <section class="starter">
      <p class="eyebrow">First up</p>
      <h1 class="starter-name">{round.starter}</h1>
      <p class="direction">
        <span class="dir-icon" class:ccw={!round.clockwise} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path d="M20 3v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        Play passes <strong>{round.clockwise ? 'clockwise' : 'counter-clockwise'}</strong>
      </p>
      <p class="how">One word or phrase each about the secret word, then vote.</p>
    </section>

    <section class="card win-card">
      <h2 class="eyebrow">How to win</h2>
      <ul class="win-list">
        <li>
          <span class="who crew">Everyone else</span>
          <span>Vote out the impostor — and don’t let them guess the word.</span>
        </li>
        <li>
          <span class="who imp">Impostor</span>
          <span>Survive the vote, <em>or</em> get voted out but guess the secret word.</span>
        </li>
      </ul>
    </section>

    <section class="card winner">
      <h2 class="eyebrow">Who won this round?</h2>
      <div class="winner-btns" role="group" aria-label="Round winner">
        <button
          class="winner-btn imp"
          aria-pressed={round.winner === 'imposter'}
          onclick={() => game.setWinner('imposter')}
        >
          Impostor
        </button>
        <button
          class="winner-btn crew"
          aria-pressed={round.winner === 'players'}
          onclick={() => game.setWinner('players')}
        >
          Players
        </button>
      </div>
      <Scoreboard />
    </section>

    <section class="card verify">
      <h2 class="eyebrow">After the vote</h2>
      <p class="verify-text">
        Impostor guessing the word? Check their answer here — no peeking early.
      </p>
      {#if wordShown}
        <p class="the-word">{round.word}</p>
        <button class="btn btn-quiet" onclick={() => (wordShown = false)}>Hide it</button>
      {:else}
        <button class="btn btn-ghost" onclick={() => (wordShown = true)}>
          Reveal the secret word
        </button>
      {/if}
    </section>
  </div>

  <div class="screen-footer">
    <button class="btn btn-primary" onclick={() => game.playAgain()}>
      Play again
    </button>
  </div>
</div>

<style>
  .sections {
    display: grid;
    gap: 1rem;
    align-content: start;
  }

  .starter {
    text-align: center;
    padding: 1.5rem 0 0.75rem;
  }

  .starter-name {
    font-size: clamp(2.6rem, 14vw, 3.6rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--gold);
    margin: 0.3rem 0 0.6rem;
    overflow-wrap: anywhere;
  }

  .direction {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.05rem;
  }

  .dir-icon {
    display: grid;
    place-items: center;
    color: var(--teal);
  }

  .dir-icon.ccw svg {
    transform: scaleX(-1);
  }

  .how {
    color: var(--muted);
    font-size: 0.95rem;
    margin-top: 0.5rem;
  }

  .win-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.75rem;
  }

  .win-list li {
    display: grid;
    gap: 0.2rem;
    font-size: 0.95rem;
  }

  .who {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .who.crew {
    color: var(--teal);
  }

  .who.imp {
    color: var(--coral);
  }

  .winner {
    display: grid;
    gap: 0.8rem;
  }

  .winner-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .winner-btn {
    min-height: 3.1rem;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1.5px solid var(--line);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease,
      transform 0.12s ease;
  }

  .winner-btn:active {
    transform: scale(0.97);
  }

  .winner-btn.imp[aria-pressed='true'] {
    background: color-mix(in oklab, var(--coral) 22%, var(--surface));
    border-color: var(--coral);
    color: var(--coral);
  }

  .winner-btn.crew[aria-pressed='true'] {
    background: color-mix(in oklab, var(--teal) 20%, var(--surface));
    border-color: var(--teal);
    color: var(--teal);
  }

  .verify {
    display: grid;
    gap: 0.7rem;
  }

  .verify-text {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .the-word {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.8rem;
    text-align: center;
    color: var(--teal);
    overflow-wrap: anywhere;
  }
</style>
