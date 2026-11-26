<script lang="ts">
  import { game } from './game.svelte'

  let dialog = $state<HTMLDialogElement>()

  $effect(() => {
    if (game.confirmLeave && !dialog?.open) dialog?.showModal()
    if (!game.confirmLeave && dialog?.open) dialog.close()
  })
</script>

<dialog
  bind:this={dialog}
  closedby="any"
  aria-labelledby="leave-title"
  onclose={() => (game.confirmLeave = false)}
>
  <div class="dialog-card sheet">
    <h2 id="leave-title">End this round?</h2>
    <p class="lead">Some players already saw their role. You’ll need a new round with a new word.</p>
    <div class="actions">
      <button class="btn btn-primary" onclick={() => game.leaveConfirmed()}>End round</button>
      <button class="btn btn-quiet" onclick={() => (game.confirmLeave = false)}>Keep playing</button>
    </div>
  </div>
</dialog>

<style>
  .sheet {
    display: grid;
    gap: 12px;
  }

  .lead {
    color: var(--text-2);
    font-size: 0.9375rem;
  }

  .actions {
    display: grid;
    gap: 4px;
    margin-top: 8px;
  }
</style>
