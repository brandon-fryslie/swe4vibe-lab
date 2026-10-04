# wrong-thing-perfectly

**The symptom:** "It did exactly what I said. That's not what I meant. Round eleven."

**The disease:** a goal with no checkable done-state. "Add search to the customer list" is a sentence with holes — search *what*, matching *how*, for *whom* — and the AI fills every hole with the most statistically ordinary guess, then builds that guess flawlessly. In `search.js` the guess is name-only, exact-case substring match: it honors every word of the request and misses every search a real user would type. Nothing errors. The wrong thing ships in perfect condition.

## Files

- `search.js` — the broken version: the request as worded, built perfectly.
- `done-checks.mjs` — the spec: what the request *meant*, written as four runnable checks before the build.
- `search-fixed.js` — the same five lines of effort, built against the spec instead of the sentence.
- `demo.mjs` — accepts the before the way the words imply (it passes), then runs the spec against both versions and asserts the split: guess 1/4, spec-built 4/4.

## Run it

```sh
node demo.mjs
```

## Poke it

Take any feature request you're about to send your AI and write three checks it must pass before you send it — one normal use, one the way *you'd* actually use it, one weird input. Then compare what comes back against what usually comes back. The build doesn't get smarter; the target does.
