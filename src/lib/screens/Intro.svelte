<script lang="ts">
  import { game } from '../game.svelte'
</script>

<div class="screen">
  <div class="screen-body intro">
    <p class="eyebrow">One phone · 3+ friends</p>
    <h1 class="title">Impos<span class="glitch">t</span>oor</h1>
    <p class="tagline">Everyone gets the secret word. Except one of you.</p>

    <ol class="steps">
      <li>
        <h3>Pass the phone</h3>
        <p>Each player secretly checks their role. Regular players see the secret word — the impostor gets a vague hint at best.</p>
      </li>
      <li>
        <h3>Talk it out</h3>
        <p>Going around the circle, everyone says one word or phrase about the secret word. Too vague? Suspicious. Too specific? You just helped the impostor.</p>
      </li>
      <li>
        <h3>Vote</h3>
        <p>Point at who you think is faking it. Vote out the impostor to win — but if they guess the word, they steal the victory. Survive the vote and the impostor wins outright.</p>
      </li>
    </ol>
  </div>

  <div class="screen-footer">
    <button class="btn btn-primary" onclick={() => game.finishIntro()}>
      Set up a game
    </button>
  </div>
</div>

<style>
  .intro {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1.5rem;
  }

  .title {
    font-size: clamp(3rem, 16vw, 4.2rem);
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .glitch {
    color: var(--coral);
    display: inline-block;
    rotate: 8deg;
  }

  .tagline {
    font-size: 1.15rem;
    color: var(--muted);
    margin-bottom: 1rem;
  }

  .steps {
    list-style: none;
    counter-reset: step;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.75rem;
  }

  .steps li {
    counter-increment: step;
    background: var(--bg-raised);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 1rem 1.1rem 1rem 3.4rem;
    position: relative;
  }

  .steps li::before {
    content: counter(step);
    position: absolute;
    left: 1.05rem;
    top: 1.05rem;
    width: 1.7rem;
    height: 1.7rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--surface-2);
    color: var(--gold);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.95rem;
  }

  .steps h3 {
    font-size: 1.05rem;
    margin-bottom: 0.2rem;
  }

  .steps p {
    color: var(--muted);
    font-size: 0.95rem;
  }
</style>
