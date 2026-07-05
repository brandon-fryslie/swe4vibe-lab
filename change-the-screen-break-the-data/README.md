# change-the-screen-break-the-data

**The scar:** you asked for "$45.00 instead of $45" — a cosmetic change — and two days later a customer's cart says `$45.0012.5`, on the screen *and* in the database. Now you don't believe "it's just visual" anymore, and you're right not to.

**The disease:** math and world in one body. **Every function in your app either figures something out or touches the world — and the ones that do both are the ones you're afraid of.** When compute, screen, and save share one variable, there is no line a display change physically cannot cross — format the value for the screen and you formatted the database's copy too, because there is only one copy. The full walk-through is the swe4vibe lesson of the same name.

## Files

- `expenses.js` — the diseased module: a budget tracker where every function computes totals, writes the DOM, and fires the network in one breath, all through shared state. It works. Read it and find the lines a "display tweak" could cross.
- `expenses-fixed.js` — the same tracker with the wires uncrossed: a pure core that only computes, and thin effect edges that only act.
- `demo.mjs` — the lesson's cart shape run live: the same "two decimals" edit applied to the fused shape (string reaches the database, next add-to-cart glues `"45.0012.5"` into the saved order) and to the split shape (screen formatted, database holds `56.25`, a number, every time). Every outcome asserted.

## Run it

```sh
node demo.mjs
```

## Poke it

Ask your AI for any display change to `expenses.js` — "show the food bar as a fraction", "round the report to whole dollars" — and trace which saved or computed values it touched. Then make the same request against `expenses-fixed.js` and watch it land in an edge, with nowhere else to go.
