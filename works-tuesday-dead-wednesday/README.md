# works-tuesday-dead-wednesday

**The symptom:** same code — works Tuesday, dead Wednesday. Breaks on your friend's phone, works on yours, and somewhere in week two you type "it breaks if I click too fast."

**The disease:** a race with no owner. **Your app never breaks randomly. It breaks when two things finish in an order nobody chose.** Two requests share one finish line — the same variable, the same screen — and no line of code says who's allowed to win, so arrival order decides. Network timing was an input to your program all along; nobody told you, so you never wrote code for it. The full walk-through is the swe4vibe lesson of the same name.

## Files

- `demo.mjs` — the unowned finish line, run through both days: in-order arrival (Tuesday, looks correct) and stale-lands-last (Wednesday, screen lies). Then the request-id owner run through the same Wednesday, where the stale write is impossible. Arrival order is forced with manually-resolved promises — the race is deterministic here, no timers, no luck.
- `dashboard-fixed.js` — a real cold-test artifact: an orders dashboard (filter dropdown + interval refresh + export button, three racers) after this exact fix — one `newestWriter` owner per user-visible target. The demo's three-line rule is this file's pattern at full size.

## Run it

```sh
node demo.mjs
```

## Poke it

Add a third racer to the demo's Wednesday block — a slow `'boo'` request that lands in the middle — and check both shapes again. Then find the `await` in your own app whose result writes to the screen, and ask what happens when two are in flight.
