// The lesson's claim, executed:
//   before — "add search to the customer list" gets built exactly as worded:
//     name-only, exact-case substring match. It passes the acceptance the
//     words imply (search a name, get the customer) — and silently returns
//     nothing for the searches the requester actually meant: lowercase, by
//     email, with a stray space. No error. The wrong thing, built perfectly.
//   after — the same request specced as runnable checks BEFORE the build;
//     the delivered guess fails the spec loudly (1 of 4), the spec-built
//     version passes 4 of 4. The guess didn't get smarter; the target did.
// Exit 0 iff both claims hold when actually run.
import assert from 'node:assert/strict'
import { searchCustomers as delivered } from './search.js'
import { searchCustomers as specBuilt } from './search-fixed.js'
import { CUSTOMERS, runChecks } from './done-checks.mjs'

// ---------- BEFORE: acceptance by the words ----------
// The request said "search the customer list." Here's search, searching:
const wordsLevelAcceptance = delivered(CUSTOMERS, 'Ana')
console.log('BEFORE, checked the way the request was worded:')
console.log(`  search "Ana" →`, wordsLevelAcceptance.map((c) => c.name))

// claim: by the words, it works — ship it
assert.equal(wordsLevelAcceptance.length, 1)
assert.equal(wordsLevelAcceptance[0].id, 'c1')

// ...and here is what the requester meant, silently returning nothing:
const meant = [
  ['smith', 'the lowercase search everyone types'],
  ['otto.marsh@', 'the email lookup support actually does'],
  [' Kai ', 'the paste with a stray space'],
]
for (const [query, why] of meant) {
  const got = delivered(CUSTOMERS, query)
  console.log(`  search "${query}" (${why}) → ${got.length} results`)
  // claim: each intended use returns nothing — no error, no signal, no result
  assert.equal(got.length, 0)
}

// ---------- AFTER: acceptance by a spec that ran before the build ----------
// [LAW:verifiable-goals] a goal with no checkable done-state gets a plausible
// guess; write the done-state first and the guess becomes a target.
const guessScore = runChecks(delivered)
const specScore = runChecks(specBuilt)
const passes = (score) => score.filter((c) => c.pass).length

console.log('\nAFTER, the same request written as checks first:')
for (const c of guessScore)
  console.log(`  ${c.pass ? 'PASS' : 'FAIL'} (delivered guess) ${c.name}`)
for (const c of specScore)
  console.log(`  ${c.pass ? 'PASS' : 'FAIL'} (built to spec)   ${c.name}`)

// claim: the spec catches the guess before it ships (1 of 4)...
assert.equal(passes(guessScore), 1)
// ...and the version built against the spec meets all of it (4 of 4)
assert.equal(passes(specScore), 4)

console.log('\nclaims hold: the words-built search passes the words and fails the')
console.log('intent 3 ways, silently; the spec-built search passes all 4 checks.')
