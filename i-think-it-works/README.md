# i-think-it-works

**The scar:** the AI says **Done!** — checkmarks, confidence. You run the app, click the thing, it does the thing. And then the question you've never once been able to answer: *…is it done, though?* Every ship is a breath-hold.

**The disease:** your goal was never given a checkable shape, so there is literally nothing for "done" to be checked against. **"It works" is a feeling; "it passes these checks" is a fact — and feelings don't survive contact with users.** When you ran the feature once, you verified one point in the space of things that can happen to that code — the same point the AI checked before saying Done, so your click added zero new evidence.

This is the specimen behind the swe4vibe lesson of the same name.

## Files

- `pace.js` — the delivery. A running-pace calculator that "worked when tried once" — and silently reads a 1-hour race as one minute, prints `7:60 per mile`, and returns `Infinity:NaN` on a zero distance.
- `pace-fixed.js` — the same feature after its failing checks demanded a fix: illegal input throws instead of returning plausible garbage.
- `pace-checks.mjs` — the definition of done: 23 runnable checks with an exit-code contract. `node pace-checks.mjs pace.js` → 8/23, exit 1. `node pace-checks.mjs pace-fixed.js` → 23/23, exit 0.
- `demo.mjs` — the whole acceptance story, asserted: the happy-path-only process ships NaN; the written definition of done catches it before customers do.

## Run it

```sh
node demo.mjs
```

## Poke it

Run `node pace-checks.mjs pace.js` and read which checks fail — every failure is a bug that a single happy-path click could never find. Then take the next feature your AI declares **Done!** and, before shipping, ask it to write the checks first.
