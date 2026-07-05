# ai-goes-in-circles

**The scar:** the AI keeps "fixing" the bug and it keeps coming back in a different costume — banner stuck, then banner next to results, then the spinner jammed. Fourth time this week.

**The disease:** illegal states. **A bug that keeps coming back doesn't live in your logic. It lives in the states your data is allowed to be in.** Four separate flags that are supposed to move together can combine into sixteen states when only four are real — and every AI patch locks one door of a twelve-door mansion. The full walk-through is the swe4vibe lesson of the same name.

## Files

- `demo.mjs` — the diseased shape (four flags that can disagree) and the fixed shape (one `status` value), both run through the same fail-then-success sequence. Asserts the before lands in the illegal state and the after cannot write it.
- `checkout-fixed.js` — a real cold-test artifact: a checkout whose status went through this exact fix. The diseased twin's shape — separate `submitting`/`error`/`success` flags — is the one `demo.mjs` runs; here you can read what the cure looks like in a fuller module (tagged status, payload inside the variant, exhaustive switch).

## Run it

```sh
node demo.mjs
```

## Poke it

Try to make `demo.mjs`'s after-shape show the error banner and the results at the same time — with any sequence of searches you like. Then count the flags in your own stickiest screen and list what they're allowed to say together.
