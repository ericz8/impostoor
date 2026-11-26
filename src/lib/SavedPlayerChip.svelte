<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus'

  const HOLD_MS = 550
  const MOVE_TOLERANCE = 10

  let {
    name,
    onadd,
    onforget,
  }: { name: string; onadd: () => void; onforget: () => void } = $props()

  let holding = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let start = { x: 0, y: 0 }
  // The click that ends a long press must not also add the player.
  let suppressClick = false

  function cancelHold() {
    clearTimeout(timer)
    timer = undefined
    holding = false
  }

  function onpointerdown(event: PointerEvent) {
    // Mouse users get right-click; long press is for touch and pen.
    if (event.pointerType === 'mouse') return
    start = { x: event.clientX, y: event.clientY }
    suppressClick = false
    holding = true
    timer = setTimeout(() => {
      cancelHold()
      suppressClick = true
      navigator.vibrate?.(12)
      onforget()
    }, HOLD_MS)
  }

  function onpointermove(event: PointerEvent) {
    if (!timer) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (dx * dx + dy * dy > MOVE_TOLERANCE * MOVE_TOLERANCE) cancelHold()
  }

  function onclick() {
    if (suppressClick) {
      suppressClick = false
      return
    }
    onadd()
  }

  function oncontextmenu(event: MouseEvent) {
    event.preventDefault()
    // A touch long press also fires contextmenu on Android; the timer owns that case.
    if (suppressClick || timer) return
    onforget()
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onforget()
    }
  }
</script>

<button
  class="chip"
  class:holding
  aria-label={`Add ${name}`}
  aria-keyshortcuts="Delete"
  {onclick}
  {onpointerdown}
  {onpointermove}
  onpointerup={cancelHold}
  onpointercancel={cancelHold}
  onpointerleave={cancelHold}
  {oncontextmenu}
  {onkeydown}
>
  <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
  {name}
</button>

<style>
  .chip {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 16px 0 12px;
    border-radius: var(--radius-sm);
    background: var(--surface);
    box-shadow: inset 0 0 0 1px var(--line-strong);
    color: var(--text-2);
    font-size: 0.9375rem;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    transition:
      background-color 140ms var(--ease),
      color 140ms var(--ease),
      box-shadow 140ms var(--ease);
  }

  .chip :global(svg) {
    color: var(--muted);
  }

  /* Fills toward coral while the hold counts down */
  .chip.holding {
    background: color-mix(in oklab, var(--coral) 22%, var(--surface));
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--coral) 60%, transparent);
    color: var(--text);
    transition-duration: 550ms;
    transition-timing-function: linear;
  }

  @media (hover: hover) {
    .chip:hover {
      color: var(--text);
      background: var(--raised);
    }
  }
</style>
