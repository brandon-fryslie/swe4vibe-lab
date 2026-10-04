# fixing-one-breaks-three

**The symptom:** you fix the login bug, the dashboard breaks. You fix the dashboard, checkout breaks. Every time you touch it, something unrelated explodes.

**The disease:** no seams. When changing one thing breaks another thing, those two things **are secretly the same thing.** In `order.js`, pricing, tax, the confirmation email, and the save are four jobs drinking from one shared `total` variable — one organism, one bloodstream. Poke the discount and you've poisoned everything downstream.

This is the runnable example behind the free swe4vibe lesson, published in full at [swe4vibe.com](https://swe4vibe.com).

## Files

- `order.js` — the broken version. It works. It always works, until the first edit.
- `order-fixed.js` — same behavior, cut at the seams: each pricing job hands a *finished number* forward and nothing reaches back.
- `demo.mjs` — applies the same reasonable request ("make the discount apply to shipping too") to both shapes and asserts the outcome: three breaks in the before, zero possible in the after.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI for any other pricing change in `order.js` — "add a $5 handling fee for small orders", "cap the discount at $20" — and watch which downstream numbers move. Then ask for the same change in `order-fixed.js` and diff the blast radius.
