# one-giant-tangled-thing

**The scar:** there's a change you've been meaning to make for two weeks. You open the file, you scroll, and somewhere around line 400 you close it and go do something else. You can't answer basic questions about your own app without running the whole thing and hoping. It's your app, and you're afraid of it.

**The disease:** it's all one part. **You're not scared of your app because it's big — you're scared because it's one part.** In `workout-report.js`, parsing, folding, deriving, formatting, and printing are fused into one function: the only runnable piece is the whole app, a `.toFixed` string sits in the middle of the math waiting for the first `+` to touch it, and one output branch has never once executed. No line is wrong; the bug lives *between* the jobs.

This is the specimen behind the swe4vibe lesson of the same name.

## Files

- `workout-report.js` — the diseased blob. Run it: the report is correct. It stays correct right up until an edit lands between its fused jobs.
- `workout-report-fixed.js` — the same app as a pure pipeline (parse → summarize → derive → format), printing only at the edge. Byte-identical output; every part callable alone.
- `golden-output.txt` — the output both versions must produce, byte for byte.
- `demo.mjs` — runs the lesson's executed example (a trip splitter with the same disease), fires the landmine with one reasonable request ("add the $4.50 city tax" → `$126.674.5` and NaN balances), shows the after can't break that way, then proves the specimen pair matches the golden and that the fixed module imports without printing.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI to "add a $4.50 per-session fee to the average" in `workout-report.js` and watch where the string lands. Then try answering "what's my run pace?" without printing the whole report — you can't. In `workout-report-fixed.js` it's `runPace(summarize(log.map(parseEntry)))`, one call, no side effects.
