<script lang="ts">
  import Download from '@lucide/svelte/icons/download'
  import CircleQuestionMark from '@lucide/svelte/icons/circle-question-mark'
  import Pencil from '@lucide/svelte/icons/pencil'
  import Plus from '@lucide/svelte/icons/plus'
  import Minus from '@lucide/svelte/icons/minus'
  import X from '@lucide/svelte/icons/x'
  import { game, CUSTOM_ID, MIN_PLAYERS } from '../game.svelte'
  import { pwa } from '../pwa.svelte'
  import { categories } from '../words'
  import InstallSheet from '../InstallSheet.svelte'
  import CustomWordsSheet from '../CustomWordsSheet.svelte'
  import Scoreboard from '../Scoreboard.svelte'
  import Wordmark from '../Wordmark.svelte'
  import CategoryIcon from '../CategoryIcon.svelte'
  import SavedPlayerChip from '../SavedPlayerChip.svelte'

  let nameInput = $state('')
  let error = $state<string | null>(null)
  let installSheet = $state<InstallSheet>()
  let customSheet = $state<CustomWordsSheet>()
  let forgotten = $state<{ name: string; index: number } | null>(null)
  let undoTimer: ReturnType<typeof setTimeout> | undefined

  const selectedCount = $derived(game.selectedCategories.length)

  function toggleCustom() {
    // Nothing to include yet, so jump straight to the editor instead.
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

  function forget(name: string) {
    const index = game.forgetRecentPlayer(name)
    forgotten = { name, index }
    clearTimeout(undoTimer)
    undoTimer = setTimeout(() => (forgotten = null), 5000)
  }

  function undoForget() {
    if (forgotten) game.restoreRecentPlayer(forgotten.name, forgotten.index)
    forgotten = null
    clearTimeout(undoTimer)
  }

  const startHint = $derived.by(() => {
    if (game.wordPool.length === 0) {
      return 'Your words list is empty. Add some or pick another category'
    }
    if (game.players.length < MIN_PLAYERS) {
      const missing = MIN_PLAYERS - game.players.length
      return `Add ${missing} more player${missing === 1 ? '' : 's'} to start`
    }
    return null
  })
</script>

<div class="screen">
  <header class="topbar">
    <h1><Wordmark /></h1>
    <div class="topbar-actions">
      {#if pwa.showInstall}
        <button
          class="icon-btn"
          aria-label="Install app"
          onclick={() =>
            pwa.canPromptNatively ? pwa.promptInstall() : installSheet?.open()}
        >
          <Download size={20} strokeWidth={1.75} />
        </button>
      {/if}
      <button class="icon-btn" aria-label="How to play" onclick={() => game.go('intro')}>
        <CircleQuestionMark size={20} strokeWidth={1.75} />
      </button>
    </div>
  </header>

  <div class="screen-body sections">
    {#if game.imposterWins + game.playerWins > 0}
      <Scoreboard />
    {/if}

    <section aria-labelledby="words-title">
      <div class="section-head">
        <h2 id="words-title">Words</h2>
        <div class="head-actions">
          <span class="meta">{selectedCount === 0 ? 'All categories' : `${selectedCount} selected`}</span>
          <button class="text-btn" onclick={() => game.toggleAllCategories()}>
            {game.allCategoriesSelected ? 'Clear' : 'Select all'}
          </button>
        </div>
      </div>
      <div class="chip-grid" role="group" aria-labelledby="words-title">
        {#each categories as category (category.id)}
          <button
            class="cat-chip"
            aria-pressed={game.selectedCategories.includes(category.id)}
            onclick={() => game.toggleCategory(category.id)}
          >
            <CategoryIcon id={category.id} />
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
            <CategoryIcon id={CUSTOM_ID} />
            Your words
            {#if game.customWords.length > 0}
              <span class="count-meta">{game.customWords.length}</span>
            {/if}
          </button>
          <button class="custom-edit" aria-label="Edit your words" onclick={() => customSheet?.open()}>
            <Pencil size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </section>

    <section aria-labelledby="round-title">
      <div class="section-head">
        <h2 id="round-title">Round</h2>
      </div>
      <div class="settings card">
        <div class="setting">
          <div class="setting-text">
            <span class="setting-name" id="imp-label">Impostors</span>
            {#if game.players.length >= MIN_PLAYERS}
              <span class="setting-note">Up to {game.maxImposters} with {game.players.length} players</span>
            {/if}
          </div>
          <div class="stepper" role="group" aria-labelledby="imp-label">
            <button
              class="icon-btn"
              aria-label="Fewer impostors"
              disabled={game.effectiveImposters <= 1}
              onclick={() => game.setImposterCount(game.effectiveImposters - 1)}
            >
              <Minus size={18} strokeWidth={1.75} />
            </button>
            <output class="count" aria-live="polite">{game.effectiveImposters}</output>
            <button
              class="icon-btn"
              aria-label="More impostors"
              disabled={game.effectiveImposters >= game.maxImposters}
              onclick={() => game.setImposterCount(game.effectiveImposters + 1)}
            >
              <Plus size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <label class="setting">
          <div class="setting-text">
            <span class="setting-name">Say how many</span>
            <span class="setting-note">Off keeps the impostor count secret</span>
          </div>
          <input type="checkbox" class="switch" bind:checked={game.showImposterCount} />
        </label>

        <label class="setting" class:inert-setting={!game.hintApplies}>
          <div class="setting-text">
            <span class="setting-name">Impostor hint</span>
            <span class="setting-note">
              {game.hintApplies
                ? 'Only for an impostor who speaks first or second'
                : 'Undercover impostors get a decoy instead'}
            </span>
          </div>
          <input type="checkbox" class="switch" bind:checked={game.hintsOn} disabled={!game.hintApplies} />
        </label>

        <label class="setting">
          <div class="setting-text">
            <span class="setting-name">Blind voting</span>
            <span class="setting-note">Pass the phone to vote in secret</span>
          </div>
          <input type="checkbox" class="switch" bind:checked={game.blindVoting} />
        </label>

        <label class="setting">
          <div class="setting-text">
            <span class="setting-name">Undercover</span>
            <span class="setting-note">Impostors get a similar word and aren’t told</span>
          </div>
          <input type="checkbox" class="switch" bind:checked={game.undercoverOn} />
        </label>
      </div>
    </section>

    <section aria-labelledby="players-title">
      <div class="section-head">
        <h2 id="players-title">Players</h2>
        <span class="meta">{game.players.length}</span>
      </div>

      {#if game.players.length > 0}
        <ul class="player-list">
          {#each game.players as player (player)}
            <li>
              <span class="player-name">{player}</span>
              <button
                class="icon-btn"
                aria-label={`Remove ${player}`}
                onclick={() => game.removePlayer(player)}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      <form class="add-row" onsubmit={submitPlayer}>
        <input
          class="field"
          type="text"
          placeholder="Name"
          aria-label="Player name"
          autocomplete="off"
          autocapitalize="words"
          enterkeyhint="done"
          maxlength="20"
          bind:value={nameInput}
        />
        <button type="submit" class="add-btn" aria-label="Add player">
          <Plus size={20} strokeWidth={1.75} />
        </button>
      </form>
      {#if error}
        <p class="error" role="alert">{error}</p>
      {/if}

      {#if game.quickAddPlayers.length > 0}
        <div class="saved">
          <div class="saved-head">
            <h3>Saved</h3>
            <span class="meta gesture-hint"></span>
          </div>
          <div class="chip-row">
            {#each game.quickAddPlayers as name (name)}
              <SavedPlayerChip {name} onadd={() => quickAdd(name)} onforget={() => forget(name)} />
            {/each}
          </div>
        </div>
      {/if}
    </section>
  </div>

  <div class="screen-footer">
    {#if forgotten}
      <div class="undo" role="status">
        <span>Removed {forgotten.name}</span>
        <button onclick={undoForget}>Undo</button>
      </div>
    {:else if startHint}
      <p class="start-hint">{startHint}</p>
    {/if}
    <button class="btn btn-primary" disabled={!game.canStart} onclick={() => game.startGame()}>
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
    min-height: 48px;
    margin-bottom: 16px;
  }

  .topbar-actions {
    display: flex;
    gap: 4px;
    margin-right: -8px;
  }

  .sections {
    display: grid;
    gap: 40px;
    align-content: start;
  }

  /* ------------------------------- players ------------------------------- */

  .player-list {
    list-style: none;
    margin: 0 0 8px;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  .player-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 4px 0 16px;
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line);
    border-radius: var(--radius);
  }

  .player-list .icon-btn {
    color: var(--muted);
  }

  .player-name {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    font-weight: 500;
  }

  .add-row {
    display: flex;
    gap: 8px;
  }

  .add-row .field {
    flex: 1;
  }

  .add-btn {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: var(--radius);
    background: var(--raised);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    transition: background-color 140ms var(--ease);
  }

  .add-btn:active {
    background: #2e2b28;
  }

  .error {
    margin-top: 8px;
  }

  .saved {
    margin-top: 24px;
  }

  .saved-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .saved-head h3 {
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-2);
  }

  .gesture-hint::after {
    content: 'Right-click to remove';
  }

  @media (pointer: coarse) {
    .gesture-hint::after {
      content: 'Hold to remove';
    }
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* -------------------------------- round -------------------------------- */

  .settings {
    padding: 0;
  }

  .setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 64px;
    padding: 12px 12px 12px 16px;
  }

  .setting + .setting {
    box-shadow: inset 0 1px 0 var(--line);
  }

  label.setting {
    cursor: pointer;
    padding-right: 16px;
  }

  label.setting.inert-setting {
    cursor: default;
  }

  .inert-setting .setting-name {
    color: var(--text-2);
  }

  .switch:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .setting-text {
    display: grid;
    gap: 2px;
  }

  .setting-name {
    font-size: 1rem;
  }

  .setting-note {
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: var(--radius);
    background: var(--bg);
    box-shadow: inset 0 0 0 1px var(--line);
  }

  .stepper .icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 6px;
  }

  .stepper .icon-btn:disabled {
    color: var(--raised);
    background: none;
    cursor: not-allowed;
  }

  .count {
    min-width: 24px;
    text-align: center;
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--coral);
  }

  .switch {
    appearance: none;
    flex-shrink: 0;
    width: 48px;
    height: 28px;
    margin: 0;
    border-radius: 14px;
    background: var(--raised);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    position: relative;
    cursor: pointer;
    transition: background-color 180ms var(--ease);
  }

  .switch::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--muted);
    transition:
      transform 180ms var(--ease),
      background-color 180ms var(--ease);
  }

  .switch:checked {
    background: var(--text);
  }

  .switch:checked::before {
    transform: translateX(20px);
    background: var(--bg);
  }

  /* -------------------------------- words -------------------------------- */

  .head-actions {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  /* Tall hit area, tucked into the heading's baseline */
  .text-btn {
    margin: -12px -8px;
    padding: 12px 8px;
    border-radius: var(--radius-sm);
    color: var(--text);
    font-size: 0.875rem;
    text-decoration: underline;
    text-decoration-color: var(--line-strong);
    text-underline-offset: 4px;
    transition: text-decoration-color 140ms var(--ease);
  }

  @media (hover: hover) {
    .text-btn:hover {
      text-decoration-color: var(--text);
    }
  }

  .chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .cat-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 14px 0 12px;
    border-radius: var(--radius-sm);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line);
    color: var(--text-2);
    font-size: 0.9375rem;
    transition:
      background-color 140ms var(--ease),
      color 140ms var(--ease),
      box-shadow 140ms var(--ease);
  }

  .cat-chip :global(svg) {
    flex-shrink: 0;
    color: var(--muted);
    transition: color 140ms var(--ease);
  }

  .cat-chip[aria-pressed='true'],
  .custom-chip.selected {
    background: var(--raised);
    color: var(--text);
    box-shadow:
      inset 0 0 0 1px var(--text-2),
      inset 0 1px 0 rgb(255 255 255 / 0.08);
  }

  .cat-chip[aria-pressed='true'] :global(svg),
  .custom-chip.selected :global(svg) {
    color: var(--text);
  }

  .custom-chip {
    padding: 0;
    overflow: hidden;
  }

  .custom-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    padding: 0 12px;
  }

  .count-meta {
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .custom-edit {
    display: grid;
    place-items: center;
    align-self: stretch;
    width: 40px;
    box-shadow: inset 1px 0 0 var(--line);
  }

  @media (hover: hover) {
    .cat-chip:not(.custom-chip):hover,
    .custom-toggle:hover,
    .custom-edit:hover {
      color: var(--text);
    }
  }

  /* ------------------------------- footer -------------------------------- */

  .start-hint {
    text-align: center;
    color: var(--text-2);
    font-size: 0.875rem;
  }

  .undo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 4px 0 16px;
    border-radius: var(--radius);
    background: var(--raised);
    box-shadow: inset 0 0 0 1px var(--line);
    font-size: 0.9375rem;
  }

  .undo button {
    height: 36px;
    padding: 0 12px;
    border-radius: 6px;
    font-weight: 500;
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
