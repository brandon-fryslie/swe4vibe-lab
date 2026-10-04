# one-more-option-broke-everything

**The symptom:** the request was one checkbox. "Support coupon codes" was an afternoon: one more option, one more `if`, tested, shipped. Then clearance weekend happens and a customer screenshot lands in your inbox: **Total: $-1.00**. You go looking for the broken line and there isn't one — every option does exactly what it says, alone.

**The disease:** modes. **Every option you add doubles the number of programs you're shipping — and you've only ever run a handful of them.** Each flag switches lines on and off, so every combination is a genuinely different program. `traffic-report.js` carries five boolean options: thirty-two programs wearing one function's name, of which the request-by-request process ever ran about six. Two of its interactions silently change what SHARE and TOTAL *mean*; one dark cell prints `NaN%`.

This is the runnable example behind the swe4vibe lesson of the same name.

## Files

- `traffic-report.js` — the broken version: five flags, 2⁵ programs, interactions nobody designed.
- `traffic-report-fixed.js` — flags translated once at the boundary into plain values (a comparator, a limit, a column list, a footer list) flowing through one render path. Deliberately behavior-preserving: the undesigned interactions are kept identical and *written down*, because what SHARE should mean under `topThree` is a decision to surface, not to take silently.
- `golden.mjs` — runs all 32 combos of either version and prints a stable digest.
- `golden-32-combos.txt` — the digest both versions must reproduce byte-for-byte.
- `demo.mjs` — runs the lesson's executed example (four checkout flags, each correct alone, `$-1.00` on screen in combination; the values-through-one-path version can't go negative), then proves both versions match the golden and asserts the preserved tensions.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI to add a sixth option to `traffic-report.js` ("sort alphabetically") and count what just happened: 64 programs. Then add the same variation to `traffic-report-fixed.js` — it's one more value in `plan()`, and the render path you've already run 32 times doesn't grow a single branch.
