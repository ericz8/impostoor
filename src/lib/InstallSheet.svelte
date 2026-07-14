<script lang="ts">
  import { pwa } from './pwa.svelte'

  let dialog = $state<HTMLDialogElement>()

  export function open() {
    dialog?.showModal()
  }
</script>

<dialog bind:this={dialog} closedby="any" aria-labelledby="install-title">
  <div class="dialog-card sheet">
    <h2 id="install-title">Install Impostoor</h2>
    <p class="lead">
      Get it on your home screen — it opens full-screen like a native app and
      works completely offline.
    </p>

    {#if pwa.isIOS}
      <ol class="ios-steps">
        <li>
          Tap the <strong>Share</strong> button
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 3v12m0-12L8 7m4-4 4 4M5 11v9h14v-9"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          in Safari’s toolbar
        </li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
        <li>Tap <strong>Add</strong> — that’s it</li>
      </ol>
      <p class="note">Using Chrome on iPhone? Open this page in Safari first.</p>
    {:else}
      <ol class="ios-steps">
        <li>Open your browser’s menu (⋮ or the address bar icon)</li>
        <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
      </ol>
    {/if}

    <button class="btn btn-ghost" onclick={() => dialog?.close()}>Close</button>
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

  .ios-steps {
    margin: 0;
    padding-left: 1.3rem;
    display: grid;
    gap: 0.55rem;
    font-size: 0.98rem;
  }

  .ios-steps svg {
    vertical-align: -3px;
    color: var(--gold);
  }

  .note {
    color: var(--muted);
    font-size: 0.85rem;
  }
</style>
