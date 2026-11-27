<script lang="ts">
  import Play from '@lucide/svelte/icons/play'
  import Pause from '@lucide/svelte/icons/pause'
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
  import { game, TIMER_PRESETS } from './game.svelte'
  import { countdown, formatClock, pauseCountdown, remainingMs, startCountdown } from './timer'

  let clock = $state(countdown(game.timerMinutes * 60_000))
  let now = $state(Date.now())

  const remaining = $derived(remainingMs(clock, now))
  const running = $derived(clock.startedAt !== null && remaining > 0)
  const finished = $derived(remaining === 0)
  const touched = $derived(clock.startedAt !== null || clock.bankedMs > 0)

  $effect(() => {
    if (!running) return
    const id = setInterval(() => (now = Date.now()), 250)
    return () => clearInterval(id)
  })

  let buzzed = false
  $effect(() => {
    if (finished && !buzzed) {
      buzzed = true
      navigator.vibrate?.([200, 100, 200])
    }
  })

  function toggle() {
    now = Date.now()
    clock = running ? pauseCountdown(clock, now) : startCountdown(clock, now)
  }

  function reset() {
    buzzed = false
    now = Date.now()
    clock = countdown(game.timerMinutes * 60_000)
  }

  function choose(minutes: number) {
    game.timerMinutes = minutes
    reset()
  }
</script>

<div class="timer card" class:finished>
  <div class="row">
    <output class="clock" aria-label="Time left">{formatClock(remaining)}</output>
    <div class="controls">
      {#if !finished}
        <button class="icon-btn" aria-label="Reset timer" disabled={!touched} onclick={reset}>
          <RotateCcw size={20} strokeWidth={1.75} />
        </button>
      {/if}
      <button
        class="icon-btn toggle"
        aria-label={finished ? 'Reset timer' : running ? 'Pause timer' : 'Start timer'}
        onclick={finished ? reset : toggle}
      >
        {#if finished}
          <RotateCcw size={20} strokeWidth={1.75} />
        {:else if running}
          <Pause size={20} strokeWidth={1.75} />
        {:else}
          <Play size={20} strokeWidth={1.75} />
        {/if}
      </button>
    </div>
  </div>

  {#if !touched}
    <div class="presets" role="group" aria-label="Timer length">
      {#each TIMER_PRESETS as minutes (minutes)}
        <button
          class="preset"
          aria-pressed={game.timerMinutes === minutes}
          onclick={() => choose(minutes)}
        >
          {minutes} min
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .timer {
    display: grid;
    gap: 12px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .clock {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 2.5rem;
    line-height: 1;
    letter-spacing: -0.02em;
    transition: color 160ms var(--ease);
  }

  .finished .clock {
    color: var(--coral);
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  .controls .icon-btn {
    width: 48px;
    height: 48px;
  }

  .icon-btn:disabled {
    color: var(--raised);
    background: none;
    cursor: not-allowed;
  }

  .toggle {
    background: var(--text);
    color: var(--bg);
  }

  .toggle:active {
    background: #d9d2c5;
    color: var(--bg);
  }

  @media (hover: hover) {
    .toggle:hover {
      background: #d9d2c5;
      color: var(--bg);
    }
  }

  .presets {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    padding: 4px;
    border-radius: var(--radius);
    background: var(--bg);
    box-shadow: inset 0 0 0 1px var(--line);
  }

  .preset {
    height: 36px;
    border-radius: 6px;
    color: var(--text-2);
    font-size: 0.875rem;
    transition:
      background-color 140ms var(--ease),
      color 140ms var(--ease);
  }

  .preset[aria-pressed='true'] {
    background: var(--raised);
    color: var(--text);
    box-shadow: inset 0 0 0 1px var(--line-strong);
  }
</style>
