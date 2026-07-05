# every-feature-slower-than-the-last

**The scar:** the first weekend was magic — auth in an afternoon, the dashboard in an evening. Now a feature *smaller* than those takes days, the AI's diffs keep getting longer for asks that keep getting shorter, and every change ships with a side order of something else breaking.

**The disease:** carrying cost. **Code has two prices — what it costs to write and what it costs to keep — and the AI only made the first one free.** Every welded near-copy is rent, billed to every future change: find every copy, edit every copy, miss none. In `shipping.js` the pricing rule lives in four places — three calculators plus a checkout copy marked "keep in sync!" that the AI minted itself, following the pattern the file taught it.

This is the specimen behind the swe4vibe lesson of the same name.

## Files

- `shipping.js` — the diseased module. Four copies of one pricing rule; the next feature must land in all four, and each landing can miss.
- `shipping-fixed.js` — one pricing home behind a value table — which has *already taken its next feature*, a 6% fuel surcharge, as a single line.
- `demo.mjs` — re-executes the lesson's cost curve on the booking shape (holiday pricing mints copy #4, the cleaning fee misses it: quoted $715, billed $940, fee silently skipped — then the one-home shape takes both features as single edits and cannot disagree with itself), and then proves the surcharge claim on the specimen: across a 486-check input grid, every fixed price is exactly 1.06× the welded price. One line, zero copies missed.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI for the next pricing feature in both files — "add a $3 rural-address surcharge" — and count the edits each shape needs. Then ask it what the old shape would have charged you.
