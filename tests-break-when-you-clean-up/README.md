# tests-break-when-you-clean-up

**The symptom:** you had the AI clean up the file everyone tiptoes around. The cleanup is *good* — half the length, same behavior. You run the tests: seventeen failures. So you say "make the tests pass," and the AI obeys… by putting the old code back. The safety net turned out to be a cage.

**The disease:** the suite asserts *structure* — spies, call counts, helpers "exported for testing" — instead of the contract. **A good test breaks when you break a promise; a bad test breaks when you keep the promise a different way.** A structure test is a photograph of how the code happens to be written today: red on every harmless cleanup, green on a real bug that keeps the wiring intact. Wrong in both directions.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `slugify.js` — a blog-engine module, delivered AI-style with its pipeline steps on an `internals` object "exported for testing."
- `slugify.test.mjs` — the broken suite: six tests, four of them photographs (helper-existence, call counts, private step order, a spy on an intermediate argument). The bad tests ARE the example — don't fix them, study them.
- `slugify.contract.test.mjs` — the same ground covered through the public surface only.
- `probe-refactor/slugify.js` — a behavior-preserving cleanup: one chain, no internals.
- `probe-bug/slugify.js` — a real bug (lowercasing dropped), structure faithfully preserved.
- `demo.mjs` — runs both suites against all three versions and asserts the full matrix: the old suite dies on the honest refactor and keeps its structure tests green on the bug; the contract suite does exactly the opposite.

## Run it

```sh
node demo.mjs
```

## Poke it

Run `node slugify.test.mjs` from `probe-bug/`'s assembled state (the demo shows how) and watch three tests pass on code that mangles every slug. Then find the spy-style tests in your own suite — the ones that mock your own functions — and ask which promise to a caller each one protects. If the answer is none, it's a photograph.
