# maze-of-if-statements

**The symptom:** `if` inside `if` inside `else` inside `if`. You read the function with your finger on the screen, whispering conditions. You change one rule very, very carefully — and a different case changes with it. By now you route around the file like it's a downed power line.

**The disease:** rules encoded as position. **Healthy code runs the same steps every time — the variety lives in the data flowing through it, not in which lines get to run.** A branch's real meaning is its own test *plus the invisible negation of every test above it*, which is written nowhere. In `priority.js`, that invisibility is load-bearing: the `plan === 'pro' && ageDays > 5` branch can never win — a shipped rule, dead on arrival, and nothing will ever tell you. The full story is in the swe4vibe lesson of the same name.

## Files

- `priority.js` — the broken version: a support-ticket triage maze with one planted shadowed rule that no input can reach.
- `priority-fixed.js` — the rules as a data table, one small evaluator, behavior identical — the dead rule dropped because it was provably weight, not behavior.
- `demo.mjs` — runs the lesson's badge example (a new rule appended to the maze silently never fires; the same careless edit on a rule *list* works fine), sweeps the full input grid to prove the broken/fixed pair is behavior-identical, then re-plants the dead rule as a data row and *detects* it with one reachability sweep.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI "which branch of `supportPriority` in `priority.js` can never win, and why?" — then ask the same question about the `RULES` table in `priority-fixed.js` and compare how much simulating each answer took.
