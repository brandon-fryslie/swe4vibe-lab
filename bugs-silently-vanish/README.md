# bugs-silently-vanish

**The scar:** nothing crashes anymore. And also: the greeting is just… blank sometimes. The chart doesn't draw. No red text, console clean — the app simply *declines* to do things. You find yourself missing the crashes, which at least had the decency to tell you where they lived.

**The disease:** guards that skip work instead of handling a case. **A crash tells you where the bug is; a guard tells the bug where to hide.** In `weather.js` the real bug is one letter — the code reads `apiResponse.forecasts` while the API ships `forecast` — and the `if (!forecast) return` guards suppress it on every single render. The page goes quietly blank, forever, with nothing to google. The full story is in the swe4vibe lesson of the same name.

## Files

- `weather.js` — the diseased module: a weather dashboard whose guards hide a typo'd field name.
- `weather-fixed.js` — the value fixed upstream; the one *genuine* optional (`alert`, omitted when none is active) keeps its check — with both arms doing something a user can see.
- `sample-response.json` — the truth fixture: the actual shape `/api/weather` returns. This is what makes "find out why the value is missing" honestly discoverable — the answer is in the folder.
- `demo.mjs` — runs the lesson's three stages (honest crash → guarded silence → upstream fix), then renders both specimen versions against the fixture and asserts: the before is quietly blank with zero errors, the after renders everything and handles the genuine absence with a real else.

## Run it

```sh
node demo.mjs
```

## Poke it

Paste the lesson's census prompt at `weather.js`: ask your AI to classify every `if (x)` as either a real state that's earned a visible else, or a guard hiding a missing-value bug it should fix upstream. It has everything it needs — the fixture is sitting right there.
