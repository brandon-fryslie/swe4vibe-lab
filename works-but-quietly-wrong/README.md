# works-but-quietly-wrong

**The symptom:** the dashboard's been live a month. Charts draw, console clean — you're proud of this one. Then someone whose spreadsheet disagrees squints at your total. Theirs is right. Yours has been wrong since… you actually can't tell. The app performed flawlessly the entire time it was lying to you.

**The disease:** failure converted into fake success. **A swallowed error doesn't go away — it comes back as a wrong number you'll trust.** In `inventory.js`: an empty `catch` around the stock fetch, a `counts[sku] || 0` that turns "load failed" into the business fact *0 units* — which drives **REORDER NOW for every product in the building** — and a `FALLBACK_DELIVERIES` constant that renders a fictional delivery schedule indistinguishably from a real one. The full story is in the swe4vibe lesson of the same name.

## Files

- `inventory.js` — the broken version: a warehouse stock dashboard that forges data whenever an API hiccups.
- `inventory-fixed.js` — failures throw at one boundary and render explicit "couldn't load" states; no path left where a failed fetch becomes a number.
- `sample-stock.json` — the truth fixture: the actual `/api/stock` shape. Note the `holds` key — the API omits it entirely when there are no holds, which is why `holds ?? []` is the one default in this file that's *true* and must survive any fix.
- `demo.mjs` — runs the lesson's revenue example (two unrelated failures, one identical forged total, zero errors), then runs both versions through four realities — healthy, stock API down, deliveries API down, holds omitted — and asserts the forgeries, the loud fixes, and the true default both versions must keep.

## Run it

```sh
node demo.mjs
```

## Poke it

Paste the lesson's census prompt at `inventory.js`: ask your AI to classify every fallback as a default that's still *true* when the value is absent, or a forgery that changes what the data means — then have it list everything this code was willing to show you wrong data about.
