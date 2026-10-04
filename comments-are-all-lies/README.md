# comments-are-all-lies

**The symptom:** 1am, a file you haven't opened in a month, a comment: `// students get 3 attempts per quiz`. You build the retry screen around three attempts. The code says `5`. The comment has said 3 since a version of this file that no longer exists — so now you read every comment and then read the code anyway, because you've been burned.

**The disease:** the what-comment. **A comment about *what* the code does is a copy of the code — and every copy drifts, so it's a lie on a timer.** Code is the only self-enforcing description of behavior; the prose above it is a second copy that nothing checks, breaks no test, and turns nothing red. The comments worth keeping say *why* — a reason, a constraint — because there's no original for that copy to drift from.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `scoring.js` — a quiz-scoring module whose code is entirely correct and whose comments are mostly false: `3 attempts` above a value of 5, `percent from 0 to 100` above a 0–1 fraction, `easiest first` above a hardest-first sort, plus a caller-enumeration comment that was stale on arrival. One comment in the file is true and load-bearing: the district rounding policy. Find it.
- `scoring-fixed.js` — comments fact-checked: the false ones deleted, one what-comment promoted to a named constant, the single *why* kept — and verified. Behavior untouched.
- `demo.mjs` — runs comments as assertions: a shipping module goes from 3/3 TRUE to 0/3 TRUE after one routine, *correct* edit; a banner written from the prose disagrees with checkout by $8.50; and every false claim in `scoring.js` is executed against the code beneath it.

## Run it

```sh
node demo.mjs
```

## Poke it

Pick the most-commented file the AI wrote for you last week. Treat every comment as a claim and check it against the code below it. Count the false ones — then notice that nothing, anywhere, would ever have told you.
