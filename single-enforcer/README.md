# single-enforcer

**The scar:** the AI adds the same permission check in eleven places. One of them is stale now.

**The disease:** no single enforcer. `admin-api.js` pastes the same "is this caller a non-suspended admin" check into six handlers. When a real security rule lands — block suspended admins — the AI patches it into the five handlers the request was about and leaves the sixth exactly as it was, because nothing pointed back at it. `refundOrder` shipped a release earlier and nobody thought to revisit it; a suspended admin can't delete a user or export the audit log, but can still push through a refund. Every copy was correct on the day it was written. The rule itself now has six slightly different mouths.

**The fix:** one `assertAdmin()`, six callers. The invariant is written once, at one boundary; every handler routes through it instead of carrying its own paraphrase. The next security rule is a one-function edit, not a six-file hunt for every place someone thought to paste it.

## Files

- `admin-api.js` — the diseased module. Six handlers, six pasted copies of the same check — one of them one clause behind.
- `admin-api-fixed.js` — same six actions, one `assertAdmin()` underneath all of them.
- `demo.mjs` — runs a suspended admin against all six actions on both modules: five refusals and one live bypass before the fix, six refusals and zero edits to the bypassed handler after it. Also counts how many places in each file's source encode the rule.

## Run it

```sh
node demo.mjs
```

## Poke it

Add a seventh admin action to `admin-api.js` the way the AI would — copy the nearest existing handler and paste its check. Now add the same action to `admin-api-fixed.js` by calling `assertAdmin()`. Then ask your AI to add an eighth rule ("also block admins flagged for a billing dispute") to both files and count the edits each one costs you.
