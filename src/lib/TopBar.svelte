<script lang="ts">
  import type { Snippet } from 'svelte'
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import { game } from './game.svelte'

  let { title, actions }: { title?: string; actions?: Snippet } = $props()
</script>

<header class="topbar">
  <button class="icon-btn back" aria-label="Back" onclick={() => game.back()}>
    <ArrowLeft size={20} strokeWidth={1.75} />
  </button>
  {#if title}
    <p class="title">{title}</p>
  {/if}
  <div class="actions">
    {@render actions?.()}
  </div>
</header>

<style>
  .topbar {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 48px;
    margin: 0 -8px 8px;
  }

  .title {
    flex: 1;
    min-width: 0;
    color: var(--text-2);
    font-size: 0.9375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    margin-left: auto;
    display: flex;
    gap: 4px;
  }
</style>
