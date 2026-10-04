# re-explain-every-session

**The symptom:** every new chat starts from zero, reads your code, and guesses wrong about everything that matters — so you re-explain your app, every single session, forever.

**The disease:** the truth about your app lives in a place that evaporates. In session 1 you told the AI "all money is integer cents" and it obeyed perfectly — but the rule landed in the *chat*, and the chat is gone. In `billing.js`, session 2's fresh context reads `amount`, guesses dollars, and a $4.99 rush fee becomes five cents with no error anywhere. The chat is a cache. The repo — names, checks, tests — is the only memory that survives the session.

## Files

- `billing.js` — the broken version: session 1's cents code (rule in the chat) plus session 2's dollars guess (chat gone).
- `billing-fixed.js` — the rule encoded where the next session must trip over it: the parameter name says the unit, one gate enforces it.
- `demo.mjs` — runs both: the chat-only version silently charges $36.05 instead of $40.99; the encoded version throws on the identical guess, with the fix in the error message.

## Run it

```sh
node demo.mjs
```

## Poke it

Open a fresh AI session on `billing.js` (no explanation, like every real session) and ask for "a $2 handling fee" — watch which unit it guesses. Then do the same on `billing-fixed.js`. The second session isn't smarter. It's reading a repo that remembers.
