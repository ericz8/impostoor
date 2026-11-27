<script lang="ts">
  import RotateCw from '@lucide/svelte/icons/rotate-cw'
  import { game } from '../game.svelte'
  import { getCategory } from '../words'
  import Scoreboard from '../Scoreboard.svelte'
  import DiscussionTimer from '../DiscussionTimer.svelte'
  import TopBar from '../TopBar.svelte'
  import CategoryIcon from '../CategoryIcon.svelte'

  const round = $derived(game.round!)
  const categoryName = $derived(getCategory(round.categoryId)?.name ?? 'Your words')
  const multiple = $derived(round.imposters.length > 1)
  const result = $derived(game.voteResult)
  const voting = $derived(game.blindVoting && !result)
  const undercover = $derived(!!round.decoy)

  let wordShown = $state(false)
</script>

<div class="screen">
  <TopBar />

  <div class="screen-body">
    <section class="starter" aria-labelledby="starter-name">
      <p class="category">
        <CategoryIcon id={round.categoryId} size={18} />
        {categoryName}
      </p>
      <p class="first-up">Goes first</p>
      <h1 class="starter-name" id="starter-name">{round.starter}</h1>
      <p class="direction">
        <span class="dir-icon" class:ccw={!round.clockwise} aria-hidden="true">
          <RotateCw size={18} strokeWidth={1.75} />
        </span>
        Then {round.clockwise ? 'clockwise' : 'counter-clockwise'}
        {#if multiple}
          <span class="sep" aria-hidden="true"></span>
          {round.imposters.length} impostors
        {/if}
      </p>
      <p class="how">
        {undercover
          ? 'One word or phrase each about your word, then vote'
          : 'One word or phrase each about the secret word, then vote'}
      </p>
      <ol class="order" aria-label="Speaking order">
        {#each round.order as player, i (player)}
          <li>
            <span class="order-num" aria-hidden="true">{i + 1}</span>{player}
          </li>
        {/each}
      </ol>
    </section>

    <section class="block" aria-labelledby="timer-title">
      <h2 id="timer-title">Discussion</h2>
      <DiscussionTimer />
    </section>

    {#if result}
      <section class="block" aria-labelledby="vote-title">
        <h2 id="vote-title">The vote</h2>
        {#if result.kind === 'out'}
          {@const imposter = game.isImposter(result.player)}
          <p class="vote-result">
            <span class="dot" class:imp={imposter} class:crew={!imposter} aria-hidden="true"></span>
            <span><strong>{result.player}</strong> was voted out, {imposter
                ? multiple ? 'an impostor' : 'the impostor'
                : 'crew'}</span>
          </p>
        {:else}
          <p class="vote-result">Nobody was voted out</p>
        {/if}
      </section>
    {/if}

    <section class="block" aria-labelledby="win-title">
      <h2 id="win-title">How to win</h2>
      <dl class="win-list">
        <div>
          <dt><span class="dot crew" aria-hidden="true"></span>Crew</dt>
          <dd>
            {multiple
              ? 'Vote out every impostor without letting one guess the word'
              : 'Vote out the impostor without letting them guess the word'}
          </dd>
        </div>
        <div>
          <dt><span class="dot imp" aria-hidden="true"></span>{multiple ? 'Impostors' : 'Impostor'}</dt>
          <dd>
            {undercover
              ? 'Survive the vote, or get voted out and guess the crew’s word'
              : 'Survive the vote, or get voted out and guess the secret word'}
          </dd>
        </div>
      </dl>
    </section>

    <section class="block" aria-labelledby="winner-title">
      <h2 id="winner-title">Who won?</h2>
      <div class="winner-btns" role="group" aria-labelledby="winner-title">
        <button
          class="winner-btn imp"
          aria-pressed={round.winner === 'imposter'}
          onclick={() => game.setWinner('imposter')}
        >
          {multiple ? 'Impostors' : 'Impostor'}
        </button>
        <button
          class="winner-btn crew"
          aria-pressed={round.winner === 'players'}
          onclick={() => game.setWinner('players')}
        >
          Crew
        </button>
      </div>
      <Scoreboard />
    </section>

    <section class="block" aria-labelledby="check-title">
      <h2 id="check-title">Check a guess</h2>
      {#if wordShown}
        <div class="word-reveal">
          {#if undercover}
            <dl class="word-pair">
              <div>
                <dt><span class="dot crew" aria-hidden="true"></span>Crew</dt>
                <dd class="the-word">{round.word}</dd>
              </div>
              <div>
                <dt><span class="dot imp" aria-hidden="true"></span>{multiple ? 'Impostors' : 'Impostor'}</dt>
                <dd class="the-word">{round.decoy}</dd>
              </div>
            </dl>
          {:else}
            <p class="the-word">{round.word}</p>
          {/if}
          <button class="btn btn-quiet" onclick={() => (wordShown = false)}>Hide</button>
        </div>
      {:else}
        <button class="btn btn-ghost" onclick={() => (wordShown = true)}>
          {undercover ? 'Show both words' : 'Show the secret word'}
        </button>
      {/if}
    </section>
  </div>

  <div class="screen-footer">
    {#if voting}
      <button class="btn btn-primary" onclick={() => game.startVote()}>Start the vote</button>
      <button class="btn btn-quiet" onclick={() => game.playAgain()}>Play again</button>
    {:else}
      <button class="btn btn-primary" onclick={() => game.playAgain()}>Play again</button>
    {/if}
  </div>
</div>

<style>
  .starter {
    padding: 16px 0 8px;
  }

  .category {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 12px 0 10px;
    border-radius: var(--radius-sm);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    color: var(--text);
    font-size: 0.9375rem;
  }

  .category :global(svg) {
    color: var(--text-2);
  }

  .first-up {
    margin-top: 32px;
    color: var(--text-2);
  }

  .starter-name {
    font-size: clamp(3rem, 16vw, 4rem);
    font-weight: 600;
    line-height: 1.02;
    letter-spacing: -0.03em;
    margin-top: 4px;
    overflow-wrap: anywhere;
  }

  .direction {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: var(--text-2);
  }

  .dir-icon {
    display: grid;
    place-items: center;
    color: var(--text);
  }

  .dir-icon.ccw :global(svg) {
    transform: scaleX(-1);
  }

  .sep {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--muted);
  }

  .how {
    margin-top: 4px;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .order {
    list-style: none;
    margin: 24px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .order li {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px 0 4px;
    border-radius: var(--radius-sm);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line);
    font-size: 0.9375rem;
  }

  .order li:first-child {
    box-shadow: inset 0 0 0 1px var(--text-2);
  }

  .order-num {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--raised);
    color: var(--text-2);
    font-size: 0.8125rem;
  }

  /* -------------------------------- blocks ------------------------------- */

  .block {
    display: grid;
    gap: 12px;
    margin-top: 40px;
  }

  .block h2 {
    font-size: 1.125rem;
  }

  .win-list {
    margin: 0;
    display: grid;
    gap: 12px;
  }

  .win-list dt {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .win-list dd {
    margin: 2px 0 0 16px;
    color: var(--text-2);
    font-size: 0.9375rem;
  }

  .vote-result {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-2);
  }

  .vote-result strong {
    color: var(--text);
    font-weight: 500;
  }

  .dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot.imp {
    background: var(--coral);
  }

  .dot.crew {
    background: var(--teal);
  }

  .word-reveal {
    display: grid;
    gap: 4px;
    padding: 20px 16px 8px;
    border-radius: 12px;
    background: var(--paper);
    color: var(--ink);
    text-align: center;
  }

  .word-reveal .btn-quiet {
    color: var(--ink-2);
  }

  .the-word {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 2rem;
    letter-spacing: -0.02em;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .word-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 0;
  }

  .word-pair dt {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--ink-2);
    font-size: 0.8125rem;
  }

  .word-pair dd {
    margin: 4px 0 0;
    font-size: 1.5rem;
    text-wrap: balance;
  }

  .winner-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .winner-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.0625rem;
    transition:
      background-color 140ms var(--ease),
      color 140ms var(--ease),
      box-shadow 140ms var(--ease),
      transform 140ms var(--ease);
  }

  .winner-btn:active {
    transform: scale(0.98);
  }

  .winner-btn.imp[aria-pressed='true'] {
    background: var(--coral);
    color: #2a0b0d;
    box-shadow: none;
  }

  .winner-btn.crew[aria-pressed='true'] {
    background: var(--teal);
    color: #06251c;
    box-shadow: none;
  }
</style>
