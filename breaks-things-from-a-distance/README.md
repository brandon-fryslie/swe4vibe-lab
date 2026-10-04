# breaks-things-from-a-distance

**The symptom:** a user reports the New Arrivals page "shows random stuff sometimes." It's fine every time you look — until they add: *"it happens after I look at the Top Rated tab."* Viewing one page rearranged a different one. The screen that's wrong isn't the screen that's guilty, and the console is spotless.

**The disease:** shared mutable state with no owner. **A value everyone can write is a value nobody owns — and what nobody owns, anything can break.** In `player.js`, one shared queue is written by things that look like reads: a "view" that in-place sorts the live array, a `_state()` snapshot that hands out live references (with one field frozen — the snapshot lies twice), and an `addToQueue` that stores the caller's own object, so editing it later rewrites history.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `player.js` — the broken version: every function in scope is a potential writer, so the suspect list for "who moved this data?" is the entire app.
- `player-fixed.js` — one owner holds the state; readers get copies, every change goes through a named writer, and the one *intended* mutation (shuffle) survives as the owner's sanctioned writer.
- `probe-original.mjs` — poke the broken version and watch the corruption narrated live.
- `probe-fixed.mjs` — the full assertion suite the fixed module must pass, including "shuffle still shuffles."
- `demo.mjs` — runs the lesson's storefront example (viewing Top Rated corrupts New Arrivals), asserts each family member of the disease against `player.js`, then proves `player-fixed.js` passes the full probe.

## Run it

```sh
node demo.mjs
```

## Poke it

Run `node probe-original.mjs` and watch a read-only view change what's playing. Then try to write the same corruption through `player-fixed.js` — every door is closed except the named writers. Note what the fix *kept*: `shuffleButton` still mutates the queue, because that mutation is its job. Ownership isn't "no mutation" — it's "no unowned mutation."
