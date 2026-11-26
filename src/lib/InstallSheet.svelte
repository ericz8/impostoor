<script lang="ts">
  import Share from '@lucide/svelte/icons/share'
  import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical'
  import { pwa } from './pwa.svelte'

  let dialog = $state<HTMLDialogElement>()

  export function open() {
    dialog?.showModal()
  }
</script>

<dialog bind:this={dialog} closedby="any" aria-labelledby="install-title">
  <div class="dialog-card sheet">
    <h2 id="install-title">Install Impostoor</h2>
    <p class="lead">Opens full screen from your home screen and works offline.</p>

    {#if pwa.isIOS}
      <ol class="steps">
        <li>
          Tap <strong>Share</strong>
          <Share size={16} strokeWidth={1.75} aria-hidden="true" />
          in Safari’s toolbar
        </li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
        <li>Tap <strong>Add</strong></li>
      </ol>
      <p class="note">Using Chrome on iPhone? Open this page in Safari first.</p>
    {:else}
      <ol class="steps">
        <li>
          Open your browser’s menu
          <EllipsisVertical size={16} strokeWidth={1.75} aria-hidden="true" />
        </li>
        <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
      </ol>
    {/if}

    <button class="btn btn-ghost" onclick={() => dialog?.close()}>Close</button>
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

  .steps {
    margin: 0;
    padding-left: 20px;
    display: grid;
    gap: 8px;
  }

  .steps strong {
    font-weight: 500;
  }

  .steps :global(svg) {
    vertical-align: -3px;
    color: var(--text-2);
  }

  .note {
    color: var(--muted);
    font-size: 0.875rem;
  }
</style>
