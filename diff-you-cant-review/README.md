# diff-you-cant-review

**The scar:** "I approve diffs I don't fully understand. I'm scared of what I've already merged."

**The disease:** reviewing generated code line-by-line, like you're the author. You're not the author — and you don't need to be. In `pricing-v2.js`, the AI's refactor keeps the receipt identical to the penny and quietly breaks two promises the rest of the app relies on: it edits the caller's items in place, and pricing the same cart twice compounds the discount. No eyeball pass catches that, because the damage isn't on any line — it's at the *seam*, in what the function promises the code around it. Write the promises down as checks and the two-hundred-line body becomes the author's problem again.

## Files

- `pricing.js` — v1, the module as it stands. Keeps its promises; nobody ever wrote them down.
- `pricing-v2.js` — the AI's refactor: shorter, cleaner, same happy-path total, two promises dead.
- `seam-checks.mjs` — the promises written down: three runnable checks that review ANY version of this module without reading its body.
- `demo.mjs` — runs the eyeball review (v2 passes, gets approved, corrupts the cart downstream), then the seam review (v2 fails 2 of 3 in milliseconds).

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI for any refactor of `pricing-v2.js` — then review it by running `seam-checks.mjs` against what comes back instead of reading the diff. Then try to write the three-check seam file for the scariest module in your own app. That file is what "reviewing" means from now on.
