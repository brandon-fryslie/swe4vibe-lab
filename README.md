# The swamp

Real diseased code, next to the fixed version, with a runnable proof that the disease is real.

Every lesson in **swe4vibe** is built on one scar — a recurring pain you've actually felt while building with AI. This repo is where those scars live as code. Not slideware snippets: each directory is a small, plausible module with a specific structural disease, the same module with the disease cut out, and a demo that *executes both* and asserts the difference. If a lesson claims "the before breaks exactly like your Tuesday afternoon," the claim runs here, or the lesson doesn't ship.

No video guru can hand you this. Clone it and poke.

## Run it

```sh
node check.mjs        # runs every specimen's demo; exit 0 iff every claim holds
```

Or go into any specimen and watch one disease up close:

```sh
cd fixing-one-breaks-three
node demo.mjs
```

## The contract

Every specimen directory holds:

- **the diseased module** (e.g. `order.js`) — code that looks fine and works today. You have written this file.
- **the fixed twin** (e.g. `order-fixed.js`) — same behavior, different shape. The disease is impossible by construction, not by carefulness.
- **`demo.mjs`** — runs both, narrates what happens, and *asserts* the claims: the before exhibits the exact failure, the after cannot. Exits non-zero if either claim doesn't hold. Nothing here is asserted in prose only.
- **`README.md`** — the scar, the disease, what to poke.

Some specimens carry extras: a fixture (the API response the code was written against), a golden output (the oracle a refactor must match), or a diseased *test suite* (yes, tests can be the disease).

## The specimens

Alphabetical — deliberately. The teaching order is the course's job, not the filesystem's.

| Directory | The scar |
|---|---|
| `ai-goes-in-circles` | The AI keeps "fixing" the bug and it keeps coming back — because illegal states are representable and the bug has infinite places to hide. |
| `breaks-things-from-a-distance` | Something, somewhere, changes a value and three unrelated screens break — a shared mutable global with no owner. |
| `bugs-silently-vanish` | `if (x)` guards everywhere stopped the crashes; now things just… don't happen, and you can't tell why. |
| `cant-reuse-your-own-code` | Every piece only works in the exact spot you built it, so you copy-paste, and now there are six. |
| `change-the-screen-break-the-data` | The button, the logic, and the fetch are welded into one function — you can't touch the display without risking the math. |
| `comments-are-all-lies` | Half the comments describe code that doesn't exist anymore, and one of them is about to cost you an hour. |
| `diff-you-cant-review` | The refactor keeps the receipt identical and breaks two promises the app relies on — invisible to eyeball review, caught in milliseconds at the seam. |
| `every-feature-slower-than-the-last` | Four copies of one shipping rule — three calculators plus the checkout copy the AI minted itself, marked "keep in sync!" — and the next feature costs four edits instead of one. |
| `fix-it-still-wrong` | You fixed it, it's still wrong — the same fact is stored in two places and only one got the memo. |
| `fixing-one-breaks-three` | Touch the discount, break the tax and the email — four jobs sharing one variable's bloodstream. The free lesson's specimen. |
| `i-think-it-works` | The happy path works, and three silent wrong answers ship with it — because "done" was never defined as something checkable. |
| `maze-of-if-statements` | Nested order-dependent branches nobody can follow — including one rule that can never fire, which nobody noticed. |
| `one-change-twenty-files` | Six functions each index the CSV's columns raw, so one column shuffle means a whole-app hunt. |
| `one-giant-tangled-thing` | One 40-line function that parses, computes, formats, and prints in a single breath — with a landmine set to go off on the first edit. |
| `one-more-option-broke-everything` | Five boolean options, thirty-two programs, and an interaction bug that fires only in the combination nobody tested. |
| `re-explain-every-session` | Session 1 was told "money is integer cents" in chat; session 2 adds a $4.99 fee as dollars — the rule lived in a place that evaporates. |
| `same-thing-three-times` | Three alert builders that differ only by prefix, length cap, and suffix — three types where there is one. |
| `tests-break-when-you-clean-up` | A test suite that goes red when you *improve* the code and stays green when you *break* it. |
| `works-but-quietly-wrong` | An empty catch and a `|| 0` turn "the fetch failed" into "0 units in stock" — and the reorder system believes it. |
| `works-tuesday-dead-wednesday` | Two in-flight responses race, the stale one lands last, and the screen lies — but only when you click fast. |
| `wrong-thing-perfectly` | "Add search to the customer list," built exactly as worded: passes the words, fails the intent three ways, silently — until the spec runs. |
| `your-code-is-allowed-to-lie` | A stale stored count, a function whose name stopped being true, a comment sorting the wrong way — and nothing in the file checks any of it. |

Every specimen maps to one swe4vibe lesson (same name). The free one — `fixing-one-breaks-three` — is published in full at [swe4vibe.com](https://swe4vibe.com).
