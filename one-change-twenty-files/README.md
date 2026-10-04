# one-change-twenty-files

**The symptom:** the API provider emails you: in v2, `poster_url` is now `posterUrl`. A rename — the smallest change that exists. The AI greps, edits a dozen files, looks thorough, ships. Three days later a user's share text reads `Watch "Blue Doors"! undefined`. There was a thirteenth place. There's always a thirteenth place.

**The disease:** scattered knowledge of a shape you don't control. **Twenty files needed editing because twenty files knew a fact that one file should own.** In `roster.js`, six functions each index the registrar's CSV columns raw — `r[0]`, `r[3]`, `r[5]` — so the same column is memorized in up to four places, and a column shuffle on the registrar's schedule becomes a whole-app hunt where every miss is a silent `undefined`, not an error.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `roster.js` — the broken version: 13 raw column-index sites spread over 6 functions.
- `roster-fixed.js` — one **adapter** (`toStudent`) owns the registrar's shape; no other line may index a raw row. Note what it deliberately does *not* fix: `parseLines`/`findStudent` still return raw rows publicly — changing that contract is a breaking decision to surface, not to take silently.
- `golden.json` — the behavior oracle both versions must match exactly.
- `demo.mjs` — runs the lesson's executed example (the rename hunt that misses the fifth site), proves both roster versions match the golden, then runs the census: where the column knowledge lives, counted from the source itself.

## Run it

```sh
node demo.mjs
```

## Poke it

Play the registrar: swap two columns in `sampleCsv` (say, email and GPA). In `roster.js`, count how many functions you have to visit to recover — and notice which wrong outputs would have shipped silently. In `roster-fixed.js`, recover by editing `toStudent` only, and re-run `demo.mjs` to check yourself against the golden.
