// The lesson's claim, executed — comments RUN as assertions:
//   before — freshly written, every comment is TRUE (3/3); after ONE routine
//     edit that never touches a comment line, the same executed comments are
//     FALSE (0/3), and a banner written from the prose disagrees with the
//     checkout computed from the code ($120 order: FREE vs $8.50).
//   after — the "what" moves into names the program executes; banner and
//     checkout derive from the same constants and agree.
//   and scoring.js (this directory) carries the same disease live: its
//     comments, run as claims, are false above perfectly working code —
//     while the one genuine why-comment (the district rounding policy)
//     survives in scoring-fixed.js with behavior identical on every check.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as v1 from './scoring.js'
import * as v2 from './scoring-fixed.js'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- V1: shipping, as first written (comments true) ----------
// flat fee is $5
// plus $1 per pound
function shippingCostV1(weightLbs) { return 5 + weightLbs * 1 }
// free shipping for orders over $100
function shippingForV1(subtotal, weightLbs) { return subtotal > 100 ? 0 : shippingCostV1(weightLbs) }

// ---------- V2: after "make shipping $7 flat + $1.50/lb, free over $150" ----------
// the edit was minimal and CORRECT; the comment lines were not what changed,
// so the comment lines were not touched
function shippingCostV2(weightLbs) { return 7 + weightLbs * 1.5 }
function shippingForV2(subtotal, weightLbs) { return subtotal > 150 ? 0 : shippingCostV2(weightLbs) }

// each comment, run as a claim about the code beneath it
const comments = [
  ['"flat fee is $5"', (cost) => cost(0) === 5],
  ['"plus $1 per pound"', (cost) => cost(3) - cost(0) === 3],
  ['"free shipping for orders > $100"', (cost, ship) => ship(120, 1) === 0],
]
const runComments = (cost, ship) => comments.filter(([, check]) => check(cost, ship)).length

const fresh = runComments(shippingCostV1, shippingForV1)
const drifted = runComments(shippingCostV2, shippingForV2)
console.log(`V1 (fresh) — running the comments as assertions: ${fresh}/3 TRUE`)
console.log(`V2 (one routine edit later) — same comments:     ${drifted}/3 TRUE`)
assert.equal(fresh, 3) // freshly written, every comment is true
assert.equal(drifted, 0) // the code is right; 100% of the prose is now false

// the harm: a second surface written from the comments' claims
const bannerFromComments = (subtotal) => (subtotal > 100 ? 'FREE shipping!' : 'Shipping from $5')
const checkout = shippingForV2(120, 1)
console.log(`\n$120 order: product page says "${bannerFromComments(120)}" | checkout charges $${checkout.toFixed(2)}`)
assert.equal(bannerFromComments(120), 'FREE shipping!')
assert.equal(checkout, 8.5) // the two copies of one fact disagree on screen

// ---------- AFTER: the "what" moves into names the code executes ----------
const FLAT_FEE = 7
const PER_LB = 1.5
// $150 matches our carrier's free-pickup minimum — below it we eat the cost
const FREE_SHIPPING_MIN = 150
const shippingFor = (subtotal, weightLbs) => (subtotal > FREE_SHIPPING_MIN ? 0 : FLAT_FEE + weightLbs * PER_LB)
const banner = (subtotal) => (subtotal > FREE_SHIPPING_MIN ? 'FREE shipping!' : 'Shipping from $' + FLAT_FEE)

console.log(`AFTER — one home per fact: banner "${banner(120)}" | checkout $${shippingFor(120, 1).toFixed(2)} — they agree`)
assert.equal(banner(120), 'Shipping from $7')
assert.equal(shippingFor(120, 1), 8.5)
for (const [s, w] of [[0, 0], [80, 2], [120, 1], [151, 3], [200, 10]]) {
  assert.equal(shippingFor(s, w), shippingForV2(s, w)) // identical behavior across the grid
}

// ---------- scoring.js: the live specimen, comments vs code ----------
const src = readFileSync(join(here, 'scoring.js'), 'utf8')

console.log('\nscoring.js — running its comments as claims:')
// "students get 3 attempts per quiz" sits directly above MAX_ATTEMPTS = 5
assert.match(src, /3 attempts/)
assert.equal(v1.MAX_ATTEMPTS, 5)
console.log(`  FALSE "students get 3 attempts per quiz" — MAX_ATTEMPTS is ${v1.MAX_ATTEMPTS}`)
// "returns the score as a percent from 0 to 100" — a perfect quiz returns 1
const perfect = v1.scoreQuiz(['a', 'b'], ['a', 'b'])
assert.equal(perfect, 1)
console.log(`  FALSE "returns the score as a percent from 0 to 100" — a perfect score returns ${perfect}`)
// "sorted by difficulty, easiest first" — the sort puts the HARDEST first
const ordered = v1.questionOrder([{ points: 1 }, { points: 5 }, { points: 3 }])
assert.equal(ordered[0].points, 5)
console.log(`  FALSE "sorted by difficulty, easiest first" — first out has ${ordered[0].points} points, the max`)
// the caller-enumeration comment: a copy of a fact whose home is elsewhere
assert.match(src, /used by results\.js/)
console.log('  COPY  "used by results.js, teacher-dashboard.js..." — a fact no comment can keep current')

// the one comment worth keeping — the why — survives the cleanup, verified:
const fixedSrc = readFileSync(join(here, 'scoring-fixed.js'), 'utf8')
assert.match(fixedSrc, /district policy says 69\.5% rounds up/)
// ...and the policy it protects is real: 139/200 = 69.5% must pass, both versions
const key200 = Array(200).fill('a')
const ans139 = [...Array(139).fill('a'), ...Array(61).fill('x')]
assert.equal(v1.passed(ans139, key200), true)
assert.equal(v2.passed(ans139, key200), true)
console.log('  KEPT  the why-comment (Math.round district policy) — verified: 69.5% passes in both versions')

// behavior equivalence: the comments were the suspects, not the behavior
const keys = [['a', 'b', 'c', 'd'], Array(10).fill('a')]
const answerSets = [['a', 'b', 'c', 'd'], ['a', 'b', 'x', 'd'], ['x', 'x', 'x', 'x'], [...Array(7).fill('a'), 'x', 'x', 'x'], []]
let cells = 0
for (const key of keys) for (const ans of answerSets) {
  assert.equal(v1.scoreQuiz(ans, key), v2.scoreQuiz(ans, key))
  assert.equal(v1.passed(ans, key), v2.passed(ans, key))
  cells += 2
}
assert.equal(v1.MAX_ATTEMPTS, v2.MAX_ATTEMPTS)
assert.deepEqual(v1.questionOrder([{ points: 1 }, { points: 5 }]), v2.questionOrder([{ points: 1 }, { points: 5 }]))
console.log(`\nbehavior equivalence scoring.js vs scoring-fixed.js: ${cells + 2} checks identical (incl. the 69.5% boundary)`)

console.log('claims hold: nothing runs a comment — the false ones drifted silently; the one why survived.')
