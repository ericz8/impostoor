<script lang="ts">
  import X from '@lucide/svelte/icons/x'
  import { game } from './game.svelte'

  let dialog = $state<HTMLDialogElement>()
  let word = $state('')
  let hint = $state('')
  let error = $state<string | null>(null)

  export function open() {
    error = null
    dialog?.showModal()
  }

  function submit(event: SubmitEvent) {
    event.preventDefault()
    error = game.addCustomWord(word, hint)
    if (!error) {
      word = ''
      hint = ''
    }
  }
</script>

<dialog bind:this={dialog} closedby="any" aria-labelledby="custom-title">
  <div class="dialog-card sheet">
    <h2 id="custom-title">Your words</h2>
    <p class="lead">Inside jokes welcome. The impostor sees the hint, so keep it vague.</p>

    <form class="form" onsubmit={submit}>
      <input
        class="field"
        type="text"
        placeholder="Secret word"
        aria-label="Secret word"
        autocomplete="off"
        maxlength="40"
        enterkeyhint="next"
        bind:value={word}
      />
      <input
        class="field"
        type="text"
        placeholder="Hint (optional)"
        aria-label="Hint for the impostor"
        autocomplete="off"
        maxlength="80"
        enterkeyhint="done"
        bind:value={hint}
      />
      <button type="submit" class="btn btn-ghost">Add word</button>
    </form>
    {#if error}
      <p class="error" role="alert">{error}</p>
    {/if}

    {#if game.customWords.length > 0}
      <ul class="word-list">
        {#each game.customWords as entry (entry.word)}
          <li>
            <div class="entry">
              <span class="word">{entry.word}</span>
              <span class="hint">{entry.hint || 'No hint'}</span>
            </div>
            <button
              class="icon-btn"
              aria-label={`Remove ${entry.word}`}
              onclick={() => game.removeCustomWord(entry.word)}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty">No words yet</p>
    {/if}

    <button class="btn btn-primary" onclick={() => dialog?.close()}>Done</button>
  </div>
</dialog>

<style>
  .sheet {
    display: grid;
    gap: 16px;
  }

  .lead {
    color: var(--text-2);
    font-size: 0.9375rem;
    margin-top: -8px;
  }

  .form {
    display: grid;
    gap: 8px;
  }

  .word-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
    max-height: 14rem;
    overflow-y: auto;
  }

  .word-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 56px;
    padding: 8px 4px 8px 16px;
    background: var(--bg);
    box-shadow: inset 0 0 0 1px var(--line);
    border-radius: var(--radius);
  }

  .entry {
    display: grid;
    min-width: 0;
  }

  .entry .word {
    font-family: var(--font-display);
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .entry .hint {
    color: var(--muted);
    font-size: 0.8125rem;
    overflow-wrap: anywhere;
  }

  .word-list .icon-btn {
    color: var(--muted);
  }

  .empty {
    color: var(--muted);
    font-size: 0.875rem;
    text-align: center;
    padding: 8px 0;
  }
</style>
