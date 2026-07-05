# fix-it-still-wrong

**The scar:** the badge says 3, the list shows 2. You find the real bug, add the missing line, fix it — actually fix it. A week later the badge is wrong again, a different way. It's the only bug that comes back after a correct fix.

**The disease:** stored copies. **A fact that lives in two places isn't stored twice — it's two facts that happen to match, until they don't.** Every copy carries an invisible job: "every path that changes the original must remember to update me" — assigned to all update paths, including the ones the AI writes next month without ever hearing of the copy. In `inventory.js` the same facts have four extra homes: a running total, a hand-synced low-stock list, cart rows that snapshot name and price, and per-mutator DOM writes — and two paths already forget.

This is the specimen behind the swe4vibe lesson of the same name.

## Files

- `inventory.js` — the diseased module. `writeOff` forgets the total *and* the low-stock list; `updatePrice` leaves stale prices in every cart row.
- `inventory-fixed.js` — `products` and `cart` are the only stored state; totals, low-stock, and the screen are computed from them on demand. Nothing to remember, so nothing to forget.
- `demo.mjs` — runs the lesson's todo-badge sequence (the badge lies, gets genuinely fixed, and lies again through the next feature) and then fires `writeOff` at both inventory files, asserting the copies lie in the before and cannot exist in the after.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI to add a "customer return" feature (stock goes back up) to `inventory.js` and check which of the four copies it remembered. Then ask for the same feature in `inventory-fixed.js` — there's nothing it can forget.
