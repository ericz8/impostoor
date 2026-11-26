<script lang="ts">
  import { game } from './lib/game.svelte'
  import Intro from './lib/screens/Intro.svelte'
  import Setup from './lib/screens/Setup.svelte'
  import Reveal from './lib/screens/Reveal.svelte'
  import Play from './lib/screens/Play.svelte'
  import Vote from './lib/screens/Vote.svelte'
  import LeaveRoundDialog from './lib/LeaveRoundDialog.svelte'

  // Keep sessionStorage/localStorage in sync with any state change.
  $effect(() => {
    game.persist()
  })
</script>

{#if game.screen === 'intro'}
  <Intro />
{:else if game.screen === 'setup'}
  <Setup />
{:else if game.screen === 'reveal'}
  <Reveal />
{:else if game.screen === 'play'}
  <Play />
{:else if game.screen === 'vote'}
  <Vote />
{/if}

<LeaveRoundDialog />
