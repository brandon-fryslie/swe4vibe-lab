// The lesson's claim, executed:
//   before — the review you can actually do on a big generated diff: run the
//     app, compare the numbers on screen. v2's receipt matches v1's to the
//     penny, so the diff gets approved — and v2 has broken two promises the
//     rest of the app relies on (it edits the caller's items; pricing twice
//     compounds the discount). The damage lands later, far from the diff.
//   after — the seam written down as three runnable checks. The same v2,
//     reviewed at the seam, fails 2 of 3 instantly — no line-reading, no
//     eyeballing, no author-level understanding required.
// Exit 0 iff both claims hold when actually run.
import assert from 'node:assert/strict'
import { priceOrder as v1 } from './pricing.js'
import { priceOrder as v2 } from './pricing-v2.js'
import { standardCart, reviewSeams } from './seam-checks.mjs'

// ---------- BEFORE: review by eyeball — run it once, compare the screen ----------
const v1Total = v1(standardCart(), 'HALFOFF').total
const v2Total = v2(standardCart(), 'HALFOFF').total
console.log('BEFORE, the eyeball review of the refactor diff:')
console.log(`  v1 receipt total: $${v1Total} | v2 receipt total: $${v2Total} — identical. Approved.`)

// claim: the only check an eyeball review can run says the diff is fine
assert.equal(v1Total, 32)
assert.equal(v2Total, 32)

// ...now the app keeps running. The cart re-renders — pricing runs again on
// the same items, like every UI on earth does:
const items = standardCart()
v2(items, 'HALFOFF')
const rerender = v2(items, 'HALFOFF')
console.log(`  after a re-render, same cart: $${rerender.total} — the discount compounded`)
console.log(`  and the caller's own data: hoodie is now $${items[0].price}, corrupted in place`)

// claim: the approved diff halves the cart again on every repricing...
assert.equal(rerender.total, 16)
// ...because it edited the caller's items — $40 hoodie is now $10 after two passes
assert.equal(items[0].price, 10)

// v1, same sequence, keeps both promises:
const items1 = standardCart()
v1(items1, 'HALFOFF')
assert.equal(v1(items1, 'HALFOFF').total, 32)
assert.equal(items1[0].price, 40)

// ---------- AFTER: review the seam, not the lines ----------
// [FRAMING:parts-and-seams] review what the part promises at its boundary;
// the two hundred lines inside are the author's problem — and you're not
// the author anymore.
const v1Review = reviewSeams(v1)
const v2Review = reviewSeams(v2)
const passes = (review) => review.filter((c) => c.pass).length

console.log('\nAFTER, the same diff reviewed at the seam:')
for (const c of v1Review) console.log(`  ${c.pass ? 'PASS' : 'FAIL'} (v1) ${c.name}`)
for (const c of v2Review) console.log(`  ${c.pass ? 'PASS' : 'FAIL'} (v2) ${c.name}`)

// claim: the current code keeps all three promises; the diff breaks two —
// caught in milliseconds, before approval, without reading a single body
assert.equal(passes(v1Review), 3)
assert.equal(passes(v2Review), 1)

console.log('\nclaims hold: the eyeball review approved the break; the seam')
console.log('review caught it before it could ship.')
