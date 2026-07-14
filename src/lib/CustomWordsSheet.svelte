<script lang="ts">
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
    <p class="lead">
      Add your own words — inside jokes welcome. The hint is what the impostor
      sees, so keep it vague.
    </p>

    <form class="form" onsubmit={submit}>
      <input
        type="text"
        placeholder="Secret word…"
        autocomplete="off"
        maxlength="40"
        enterkeyhint="next"
        bind:value={word}
      />
      <input
        type="text"
        placeholder="Hint for the impostor (optional)…"
        autocomplete="off"
        maxlength="80"
        enterkeyhint="done"
        bind:value={hint}
      />
      <button type="submit" class="btn btn-primary">Add word</button>
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
              <span class="hint">{entry.hint || 'No hint — the impostor flies blind.'}</span>
            </div>
            <button
              class="remove"
              aria-label={`Remove ${entry.word}`}
              onclick={() => game.removeCustomWord(entry.word)}
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
    {:else}
      <p class="empty">No words yet — add one above.</p>
    {/if}

    <button class="btn btn-ghost" onclick={() => dialog?.close()}>Done</button>
  </div>
</dialog>

<style>
  .sheet {
    display: grid;
    gap: 0.9rem;
  }

  .sheet h2 {
    font-size: 1.5rem;
  }

  .lead {
    color: var(--muted);
    font-size: 0.95rem;
  }

  .form {
    display: grid;
    gap: 0.5rem;
  }

  .form input {
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: var(--radius);
    padding: 0.8rem 1rem;
    font-size: 1rem;
  }

  .form input::placeholder {
    color: var(--muted);
  }

  .form input:focus {
    outline: none;
    border-color: var(--coral);
  }

  .error {
    color: var(--coral);
    font-size: 0.88rem;
  }

  .word-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.45rem;
    max-height: 14rem;
    overflow-y: auto;
  }

  .word-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 0.55rem 0.55rem 0.55rem 0.9rem;
  }

  .entry {
    display: grid;
    min-width: 0;
  }

  .entry .word {
    font-family: var(--font-display);
    font-weight: 650;
    overflow-wrap: anywhere;
  }

  .entry .hint {
    color: var(--muted);
    font-size: 0.82rem;
    overflow-wrap: anywhere;
  }

  .remove {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    color: var(--muted);
    background: var(--surface-2);
  }

  .empty {
    color: var(--muted);
    font-size: 0.9rem;
    text-align: center;
    padding: 0.4rem 0;
  }
</style>
