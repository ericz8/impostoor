<script lang="ts">
  import { game, CUSTOM_ID, MIN_PLAYERS } from '../game.svelte'
  import { pwa } from '../pwa.svelte'
  import { categories } from '../words'
  import InstallSheet from '../InstallSheet.svelte'
  import CustomWordsSheet from '../CustomWordsSheet.svelte'
  import Scoreboard from '../Scoreboard.svelte'

  let nameInput = $state('')
  let error = $state<string | null>(null)
  let installSheet = $state<InstallSheet>()
  let customSheet = $state<CustomWordsSheet>()

  function toggleCustom() {
    // Nothing to include yet — jump straight to the editor instead.
    if (game.customWords.length === 0) {
      customSheet?.open()
    } else {
      game.toggleCategory(CUSTOM_ID)
    }
  }

  function submitPlayer(event: SubmitEvent) {
    event.preventDefault()
    error = game.addPlayer(nameInput)
    if (!error) nameInput = ''
  }

  function quickAdd(name: string) {
    error = game.addPlayer(name)
  }

  const startHint = $derived.by(() => {
    if (game.selectedCategories.length === 0) return 'Pick at least one category.'
    if (game.wordPool.length === 0) {
      return 'Your words list is empty — add some or pick another category.'
    }
    if (game.players.length < MIN_PLAYERS) {
      const missing = MIN_PLAYERS - game.players.length
      return `Add ${missing} more player${missing === 1 ? '' : 's'} to start.`
    }
    return null
  })
</script>

<div class="screen">
  <header class="topbar">
    <h1 class="wordmark">Impos<span>t</span>oor</h1>
    <div class="topbar-actions">
      {#if pwa.showInstall}
        <button
          class="chip-btn"
          onclick={() =>
            pwa.canPromptNatively ? pwa.promptInstall() : installSheet?.open()}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Install
        </button>
      {/if}
      <button
        class="chip-btn round"
        aria-label="How to play"
        onclick={() => game.go('intro', 'backward')}
      >
        ?
      </button>
    </div>
  </header>

  <div class="screen-body sections">
    {#if game.imposterWins + game.playerWins > 0}
      <Scoreboard />
    {/if}

    <section>
      <h2 class="eyebrow">Categories</h2>
      <div class="chip-grid" role="group" aria-label="Word categories">
        {#each categories as category (category.id)}
          <button
            class="cat-chip"
            aria-pressed={game.selectedCategories.includes(category.id)}
            onclick={() => game.toggleCategory(category.id)}
          >
            <span aria-hidden="true">{category.emoji}</span>
            {category.name}
          </button>
        {/each}
        <div
          class="cat-chip custom-chip"
          class:selected={game.selectedCategories.includes(CUSTOM_ID)}
        >
          <button
            class="custom-toggle"
            aria-pressed={game.selectedCategories.includes(CUSTOM_ID)}
            onclick={toggleCustom}
          >
            <span aria-hidden="true">✏️</span>
            Your words{game.customWords.length > 0 ? ` (${game.customWords.length})` : ''}
          </button>
          <button
            class="custom-edit"
            aria-label="Edit your words"
            onclick={() => customSheet?.open()}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 6l3 3"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <section>
      <label class="toggle-row card">
        <div>
          <strong>Hint for the impostor</strong>
          <p>They get a vague clue about the word — easier to blend in.</p>
        </div>
        <input type="checkbox" class="switch" bind:checked={game.hintsOn} />
      </label>
    </section>

    <section>
      <h2 class="eyebrow">Players ({game.players.length})</h2>

      {#if game.players.length > 0}
        <ul class="player-list">
          {#each game.players as player (player)}
            <li>
              <span class="player-name">{player}</span>
              <button
                class="remove"
                aria-label={`Remove ${player}`}
                onclick={() => game.removePlayer(player)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      <form class="add-row" onsubmit={submitPlayer}>
        <input
          type="text"
          placeholder="Add a player…"
          autocomplete="off"
          autocapitalize="words"
          enterkeyhint="done"
          maxlength="20"
          bind:value={nameInput}
        />
        <button type="submit" class="btn btn-primary add-btn" aria-label="Add player">
          +
        </button>
      </form>
      {#if error}
        <p class="error" role="alert">{error}</p>
      {/if}

      {#if game.quickAddPlayers.length > 0}
        <p class="recent-label">Recently played with — tap to add</p>
        <div class="chip-grid">
          {#each game.quickAddPlayers as name (name)}
            <button class="recent-chip" onclick={() => quickAdd(name)}>
              <span class="plus" aria-hidden="true">+</span>{name}
            </button>
          {/each}
        </div>
      {/if}
    </section>
  </div>

  <div class="screen-footer">
    {#if startHint}
      <p class="start-hint">{startHint}</p>
    {/if}
    <button
      class="btn btn-primary"
      disabled={!game.canStart}
      onclick={() => game.startGame()}
    >
      Start round
    </button>
  </div>
</div>

<InstallSheet bind:this={installSheet} />
<CustomWordsSheet bind:this={customSheet} />

<style>
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  .wordmark {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .wordmark span {
    color: var(--coral);
    display: inline-block;
    rotate: 8deg;
  }

  .topbar-actions {
    display: flex;
    gap: 0.5rem;
  }

  .chip-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.45rem 0.9rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .chip-btn.round {
    width: 2.3rem;
    height: 2.3rem;
    padding: 0;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--gold);
  }

  .sections {
    display: grid;
    gap: 1.5rem;
    align-content: start;
  }

  .eyebrow {
    margin-bottom: 0.6rem;
  }

  .chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .cat-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.95rem;
    border-radius: 999px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    font-weight: 600;
    font-size: 0.95rem;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease;
  }

  .cat-chip[aria-pressed='true'] {
    background: color-mix(in oklab, var(--coral) 18%, var(--surface));
    border-color: var(--coral);
  }

  .custom-chip {
    padding: 0;
    overflow: hidden;
  }

  .custom-chip.selected {
    background: color-mix(in oklab, var(--coral) 18%, var(--surface));
    border-color: var(--coral);
  }

  .custom-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.7rem 0.55rem 0.95rem;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .custom-edit {
    display: grid;
    place-items: center;
    align-self: stretch;
    padding: 0 0.8rem 0 0.6rem;
    border-left: 1px solid var(--line);
    color: var(--gold);
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    cursor: pointer;
  }

  .toggle-row p {
    color: var(--muted);
    font-size: 0.88rem;
    margin-top: 0.15rem;
  }

  .switch {
    appearance: none;
    flex-shrink: 0;
    width: 3.2rem;
    height: 1.9rem;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--line);
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .switch::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0.2rem;
    translate: 0 -50%;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: var(--muted);
    transition:
      left 0.2s ease,
      background-color 0.2s ease;
  }

  .switch:checked {
    background: color-mix(in oklab, var(--gold) 45%, var(--surface-2));
  }

  .switch:checked::before {
    left: calc(100% - 1.6rem);
    background: var(--gold);
  }

  .player-list {
    list-style: none;
    margin: 0 0 0.75rem;
    padding: 0;
    display: grid;
    gap: 0.45rem;
  }

  .player-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-raised);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 0.65rem 0.65rem 0.65rem 1rem;
  }

  .player-name {
    font-family: var(--font-display);
    font-weight: 650;
    font-size: 1.05rem;
  }

  .remove {
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    color: var(--muted);
    background: var(--surface-2);
  }

  .add-row {
    display: flex;
    gap: 0.5rem;
  }

  .add-row input {
    flex: 1;
    min-width: 0;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: var(--radius);
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }

  .add-row input::placeholder {
    color: var(--muted);
  }

  .add-row input:focus {
    outline: none;
    border-color: var(--coral);
  }

  .add-btn {
    min-height: 0;
    width: 3.4rem;
    flex-shrink: 0;
    font-size: 1.6rem;
    padding: 0;
  }

  .error {
    color: var(--coral);
    font-size: 0.88rem;
    margin-top: 0.5rem;
  }

  .recent-label {
    color: var(--muted);
    font-size: 0.85rem;
    margin: 0.9rem 0 0.5rem;
  }

  .recent-chip {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: transparent;
    border: 1.5px dashed color-mix(in oklab, var(--teal) 55%, transparent);
    color: var(--teal);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .recent-chip .plus {
    font-weight: 800;
  }

  .start-hint {
    text-align: center;
    color: var(--muted);
    font-size: 0.9rem;
  }
</style>
