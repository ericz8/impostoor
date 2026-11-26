<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import { game } from '../game.svelte'
  import TopBar from '../TopBar.svelte'

  let dialog = $state<HTMLDialogElement>()
  let voter = $state<string | null>(null)
  let pick = $state<string | null>(null)

  const round = $derived(game.round!)
  // Back from here leaves the vote in place, so it is only ever replaced, not nulled.
  const vote = $derived(round.vote!)
  const outcome = $derived(vote.outcome)
  const cast = $derived(Object.keys(vote.ballots).length)
  const remaining = $derived(game.players.length - cast)
  const allCast = $derived(remaining === 0)
  const multiple = $derived(round.imposters.length > 1)
  const choices = $derived(vote.candidates.filter((p) => p !== voter))

  function openBallot(player: string) {
    voter = player
    // Never pre-fill: the next person to open this card must not see the pick.
    pick = null
    dialog?.showModal()
  }

  function castVote() {
    if (voter && pick) game.castVote(voter, pick)
    dialog?.close()
  }

  function joinNames(names: string[]) {
    return names.length <= 2
      ? names.join(' and ')
      : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
  }
</script>

<div class="screen">
  <TopBar title={vote.revote ? 'Revote' : 'Secret vote'} />

  <div class="screen-body">
    {#if outcome?.kind === 'out'}
      {@const imposter = game.isImposter(outcome.player)}
      <section class="result" aria-live="polite">
        <p class="label">Voted out</p>
        <h1 class="out-name">{outcome.player}</h1>
        <p class="votes">{outcome.votes} of {cast} votes</p>
        <p class="role" class:imp={imposter}>
          <span class="dot" aria-hidden="true"></span>
          {#if imposter}
            {multiple ? 'An impostor' : 'The impostor'}
          {:else}
            Crew
          {/if}
        </p>
        <p class="next">
          {#if imposter}
            One last chance: guess the secret word to steal the win.
          {:else}
            {multiple ? 'The impostors survive' : 'The impostor survives'} the vote.
          {/if}
        </p>
      </section>
    {:else if outcome?.kind === 'tie'}
      <section class="result" aria-live="polite">
        <p class="label">No majority</p>
        <h1 class="heading">It’s a tie</h1>
        <p class="next">
          {joinNames(outcome.tied)} got the same number of votes. Pass the phone again and vote
          between them. Another tie and nobody goes out.
        </p>
      </section>
    {:else if outcome?.kind === 'none'}
      <section class="result" aria-live="polite">
        <p class="label">{vote.revote ? 'Tied again' : 'No votes'}</p>
        <h1 class="heading">Nobody was voted out</h1>
        <p class="next">{multiple ? 'The impostors survive' : 'The impostor survives'} the vote.</p>
      </section>
    {:else}
      <h1 class="heading">{vote.revote ? 'Vote again' : 'Vote in secret'}</h1>
      <p class="sub">
        {#if vote.revote}
          Only between {joinNames(vote.candidates)}. Tap your name and pick.
        {:else}
          Tap your name and pick who you think is {multiple ? 'an impostor' : 'the impostor'}. Nobody
          sees your vote.
        {/if}
      </p>

      <div class="player-grid">
        {#each game.players as player (player)}
          {@const voted = player in vote.ballots}
          <button class="player-card" class:viewed={voted} onclick={() => openBallot(player)}>
            <span class="name">{player}</span>
            <span class="status">
              {#if voted}
                <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                Voted
              {:else}
                Tap to vote
              {/if}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="screen-footer">
    {#if outcome?.kind === 'tie'}
      <button class="btn btn-primary" onclick={() => game.revote()}>Revote</button>
    {:else if outcome}
      <button class="btn btn-primary" onclick={() => game.go('play')}>Continue</button>
    {:else}
      <button class="btn btn-primary" disabled={!allCast} onclick={() => game.countVotes()}>
        {allCast ? 'Show results' : `${remaining} still to vote`}
      </button>
    {/if}
  </div>
</div>

<dialog bind:this={dialog} aria-labelledby="ballot-title">
  <div class="dialog-card ballot">
    <h2 id="ballot-title">{voter}</h2>
    <p class="lead" id="ballot-prompt">
      Who’s {multiple ? 'an impostor' : 'the impostor'}?
    </p>

    <div class="choices" role="radiogroup" aria-labelledby="ballot-prompt">
      {#each choices as player (player)}
        <button
          class="choice"
          role="radio"
          aria-checked={pick === player}
          onclick={() => (pick = player)}
        >
          {player}
        </button>
      {/each}
    </div>

    <div class="ballot-actions">
      <button class="btn btn-primary" disabled={!pick} onclick={castVote}>Cast vote</button>
      <button class="btn btn-quiet" onclick={() => dialog?.close()}>Not me</button>
    </div>
  </div>
</dialog>

<style>
  .heading {
    font-size: 2rem;
  }

  .sub {
    margin-top: 8px;
    color: var(--text-2);
  }

  /* -------------------------------- result ------------------------------- */

  .result {
    padding-top: 16px;
  }

  .label {
    color: var(--text-2);
  }

  .result .heading {
    margin-top: 4px;
  }

  .out-name {
    font-size: clamp(3rem, 16vw, 4rem);
    font-weight: 600;
    line-height: 1.02;
    letter-spacing: -0.03em;
    margin-top: 4px;
    overflow-wrap: anywhere;
  }

  .votes {
    margin-top: 8px;
    color: var(--muted);
    font-size: 0.875rem;
  }

  .role {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    height: 36px;
    padding: 0 14px 0 12px;
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--teal) 14%, var(--surface));
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--teal) 50%, transparent);
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 1.0625rem;
  }

  .role.imp {
    background: color-mix(in oklab, var(--coral) 14%, var(--surface));
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--coral) 50%, transparent);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--teal);
  }

  .role.imp .dot {
    background: var(--coral);
  }

  .next {
    margin-top: 16px;
    color: var(--text-2);
    max-width: 22rem;
  }

  /* -------------------------------- ballot ------------------------------- */

  .ballot {
    display: grid;
    gap: 16px;
  }

  .ballot h2 {
    font-size: 1.75rem;
    overflow-wrap: anywhere;
  }

  .lead {
    margin-top: -8px;
    color: var(--text-2);
  }

  .choices {
    display: grid;
    gap: 4px;
    max-height: 18rem;
    overflow-y: auto;
  }

  .choice {
    display: flex;
    align-items: center;
    min-height: 52px;
    padding: 0 16px;
    border-radius: var(--radius);
    background: var(--bg);
    box-shadow: inset 0 0 0 1px var(--line);
    text-align: left;
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: 500;
    overflow-wrap: anywhere;
    transition:
      background-color 140ms var(--ease),
      box-shadow 140ms var(--ease);
  }

  .choice[aria-checked='true'] {
    background: var(--raised);
    box-shadow: inset 0 0 0 1px var(--text-2);
  }

  .ballot-actions {
    display: grid;
    gap: 4px;
  }
</style>
