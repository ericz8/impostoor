<script lang="ts">
  import { game } from '../game.svelte'
  import TopBar from '../TopBar.svelte'
  import Wordmark from '../Wordmark.svelte'

  // First launch has nowhere to go back to.
  const firstRun = !game.canGoBack
</script>

<div class="screen">
  {#if !firstRun}
    <TopBar title="How to play" />
  {/if}

  <div class="screen-body intro" class:first-run={firstRun}>
    <h1><Wordmark size="lg" /></h1>
    <p class="tagline">Everyone gets the secret word except the impostor. One phone, three or more friends.</p>

    <ol class="steps">
      <li>
        <h2>Pass the phone</h2>
        <p>Each player privately holds to see their role. Crew members see the secret word. The impostor sees a vague hint at best.</p>
      </li>
      <li>
        <h2>Talk it out</h2>
        <p>Going around the circle, everyone says one word or phrase about the secret word. Too vague looks suspicious. Too specific helps the impostor.</p>
      </li>
      <li>
        <h2>Vote</h2>
        <p>Point at who you think is faking it. Vote out the impostor to win, unless they then guess the word. An impostor who survives the vote wins outright.</p>
      </li>
    </ol>
  </div>

  <div class="screen-footer">
    <button class="btn btn-primary" onclick={() => game.finishIntro()}>
      {firstRun ? 'Set up a game' : 'Got it'}
    </button>
  </div>
</div>

<style>
  .intro {
    display: flex;
    flex-direction: column;
  }

  .intro.first-run {
    padding-top: 48px;
  }

  .tagline {
    margin-top: 16px;
    font-size: 1.125rem;
    line-height: 1.5;
    color: var(--text-2);
    max-width: 22rem;
  }

  .steps {
    list-style: none;
    counter-reset: step;
    margin: 40px 0 0;
    padding: 0;
    display: grid;
    gap: 24px;
  }

  .steps li {
    counter-increment: step;
    display: grid;
    grid-template-columns: 32px 1fr;
    column-gap: 12px;
  }

  .steps li::before {
    content: counter(step);
    grid-row: span 2;
    font-family: var(--font-display);
    font-size: 1.125rem;
    line-height: 1.4;
    color: var(--muted);
  }

  .steps h2 {
    font-size: 1.125rem;
    line-height: 1.4;
  }

  .steps p {
    margin-top: 4px;
    color: var(--text-2);
    font-size: 0.9375rem;
  }
</style>
