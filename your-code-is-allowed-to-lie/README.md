# your-code-is-allowed-to-lie

**The symptom:** the members screen shows someone who quit in March. The function is called `getActiveMembers()` — and there's no filter in its four lines. The name kept saying "active." The function stopped meaning it. If the names can lie, and the comments can lie, and the stored numbers can lie, reading this codebase tells you nothing.

**The disease:** unchecked representations. **Everything in your code that stands for something else is either checked by a machine or lying on a timer.** A function name represents behavior; a field name, a meaning and a unit; a stored count, the list it summarizes. Exactly one thing in the file is guaranteed true — the code that executes. Every claim *about* it drifts on a schedule, because updating the claims is part of no request anyone ever makes.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `plants.js` — a plant-care tracker where nothing checks any claim: a stored waterings count already stale (says 3, the log holds 5), a `getIndoorPlants` whose filter was edited away, a "driest first" comment over an alphabetical sort that *coincidentally* puts the driest plant first, and two functions that disagree about whether one field holds days or hours. Also two things that are telling the truth — the fix must not kill them.
- `plants-fixed.js` — every decidable lie fixed: the count derived, the names matched to behavior, the sort comment replaced by an honest name. The days-vs-hours contradiction is *flagged, not guessed* — that decision belongs to the owner.
- `demo.mjs` — runs representations as executed claims: a study-group tracker goes 4/4 TRUE → 4/4 FALSE after two routine correct edits, three surfaces show wrong output with zero errors, and every lie in `plants.js` is proven against the running code — including the coincidence camouflage.

## Run it

```sh
node demo.mjs
```

## Poke it

Open the file you trust least and ask one question per name, comment, and stored value: **who checks this?** The machine, a test, or nothing. Everything in the "nothing" column is lying now or lying soon — `plants.js` shows you all four ways it happens.
