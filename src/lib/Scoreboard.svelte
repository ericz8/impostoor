<script lang="ts">
  import { game } from './game.svelte'
</script>

<dl class="scoreboard" aria-label="Session score">
  <div class="side">
    <dt><span class="dot imp" aria-hidden="true"></span>Impostor</dt>
    <dd>{game.imposterWins}</dd>
  </div>
  <div class="side">
    <dt><span class="dot crew" aria-hidden="true"></span>Crew</dt>
    <dd>{game.playerWins}</dd>
  </div>
</dl>

<style>
  .scoreboard {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 0;
  }

  .side {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line);
  }

  dt {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-2);
    font-size: 0.875rem;
  }

  dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.5rem;
    line-height: 1;
    font-weight: 500;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot.imp {
    background: var(--coral);
  }

  .dot.crew {
    background: var(--teal);
  }
</style>
