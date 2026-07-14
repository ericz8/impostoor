<script lang="ts">
  import { game } from './game.svelte'
</script>

<div class="scoreboard" role="status" aria-label="Session score">
  <span class="side imp">
    <strong>{game.imposterWins}</strong>
    Impostor
  </span>
  <span class="divider" aria-hidden="true">·</span>
  <span class="side crew">
    <strong>{game.playerWins}</strong>
    Players
  </span>
</div>

<style>
  .scoreboard {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.45rem 1.1rem;
    width: fit-content;
    margin-inline: auto;
    font-size: 0.9rem;
    color: var(--muted);
  }

  .side {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .side strong {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 800;
  }

  .imp strong {
    color: var(--coral);
  }

  .crew strong {
    color: var(--teal);
  }

  .divider {
    color: var(--line);
  }
</style>
