# same-thing-three-times

**The symptom:** `InfoCard`, `WarningCard`, `ErrorCard` — you see them side by side one day and actually read them. They're the same. Not similar, *the same*, ninety percent line for line, and you can't tell whether the other ten percent is on purpose. Nobody decided this. It assembled itself while you were looking directly at it.

**The disease:** sameness enforced by nothing. **If two pieces of code differ only in their values, they aren't two pieces of code — they're one piece of code and a table.** In `alerts.js`, three alert builders differ by a prefix, a length limit, and a suffix — a table of values written out as three functions. Nothing says "these must stay identical," so keeping them identical is a memory job, and memory jobs are forgotten by default. The full story is in the swe4vibe lesson of the same name.

## Files

- `alerts.js` — the broken version: three near-copy alert builders for email, SMS, and Slack.
- `alerts-fixed.js` — one `buildAlert` + a `CHANNELS` table of named instances; the old names survive as one-line wrappers, output byte-identical.
- `demo.mjs` — watches the drift happen live (a new card variant inherits a missing feature from whichever copy it was cloned from), then asserts the collapsed version is output-identical to the triplets across the truncation edges.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI to "add a Discord alert" in `alerts.js` and watch it clone one of the three — quirks included. Then ask the same thing in `alerts-fixed.js` and watch it become a row.
