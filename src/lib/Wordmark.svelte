<script lang="ts">
  let { size = 'sm' }: { size?: 'sm' | 'lg' } = $props()
</script>

<!-- The tilted coral t: the odd letter out -->
<span class="wordmark {size}">Impos<span class="odd">t</span>oor</span>

<style>
  .wordmark {
    font-family: var(--font-display);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .sm {
    font-size: 1.375rem;
  }

  .lg {
    font-size: clamp(3rem, 15vw, 4rem);
    letter-spacing: -0.03em;
  }

  .odd {
    color: var(--coral);
    display: inline-block;
    rotate: 8deg;
  }
</style>
