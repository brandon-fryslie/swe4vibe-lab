# cant-reuse-your-own-code

**The symptom:** checkout needs email validation. You already built it — for signup, last month, and you were proud of it. But it won't move: it grabs `signup-email` by id and writes into `signup-error`, so on any other page it crashes. You copy, paste, rename. Now there are two. By month three there are six, and a rule change fixes four of them.

**The disease:** the code doesn't compose. **Code becomes reusable the moment it does one thing, completely, asking nothing.** A function built facing its birthplace — grabbing what it needs from the page around it, acting on its surroundings — makes its surroundings part of itself. Moving it means moving the room. In `booking.js`, every calculator does exactly this: reads its own inputs by element id, prices the booking, *and* paints the page, all in one breath.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `booking.js` — the broken version. Page-grabbing calculators that cannot run anywhere but the page they were born on — plus a quote widget copy already marked "keep in sync!".
- `booking-fixed.js` — the pricing turned around to face its inputs: a pure `computeSubtotal` that takes everything it needs and returns a number, with one thin DOM boundary calling it.
- `demo.mjs` — moves the welded validator to a page without its elements (it throws), lets the copies drift on a rule change (two verdicts for one input), then proves the fixed pricing core runs with no DOM at all — asserting every step.

## Run it

```sh
node demo.mjs
```

## Poke it

Try to compute a booking price from a plain Node script using `booking.js`. You can't — the room won't fit through the door. Then do it with `computeSubtotal` from `booking-fixed.js`: one import, one call, done.
