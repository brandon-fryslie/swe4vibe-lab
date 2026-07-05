// The lesson's claim, executed — the unit under test is the ACCEPTANCE PROCESS:
//   before — the promo-code feature passes the only check anyone ran (the happy
//     path) and ships NaN to every customer without a code.
//   after — the same delivered code judged against a written definition of done
//     fails 2 of 3 checks BEFORE shipping; the fix passes 3 of 3.
//   and the pace calculator (pace.js, "worked when tried once") fails its own
//     23-check definition of done exactly as the lesson says — H:MM:SS read as
//     M:SS, a '7:60 per mile' pace, Infinity:NaN on zero distance — while
//     pace-fixed.js passes all 23.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- the feature, as the AI delivered it ----------
const PROMOS = { SAVE10: 0.10, VIP25: 0.25 }
const cart = [{ price: 40, qty: 2 }] // $80

function checkoutTotalV1(cart, promoCode) {
  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0)
  const discount = subtotal * PROMOS[promoCode.toUpperCase()]
  return { total: subtotal - discount, applied: discount > 0 }
}

// ---------- BEFORE-PROCESS: run the thing you added, once ----------
const happy = checkoutTotalV1(cart, 'save10')
console.log(`before-process, the one check anyone ran: $80 cart + 'save10' → $${happy.total} → "works, ship it"`)
assert.deepEqual(happy, { total: 72, applied: true })

const noCode = checkoutTotalV1(cart, '')
const badCode = checkoutTotalV1(cart, 'BOGUS')
console.log(`shipped reality: no promo code → total ${noCode.total} | unknown code → total ${badCode.total}`)
assert.ok(Number.isNaN(noCode.total)) // the majority path ships NaN
assert.ok(Number.isNaN(badCode.total))

// ---------- AFTER-PROCESS: define done first, as runnable checks ----------
const DONE = [
  { name: 'valid code discounts', run: (f) => f(cart, 'save10'), expect: { total: 72, applied: true } },
  { name: 'unknown code charges full price', run: (f) => f(cart, 'BOGUS'), expect: { total: 80, applied: false } },
  { name: 'no code charges full price', run: (f) => f(cart, ''), expect: { total: 80, applied: false } },
]
const judge = (feature) => DONE.filter((c) => JSON.stringify(c.run(feature)) === JSON.stringify(c.expect)).length

const deliveredScore = judge(checkoutTotalV1)
console.log(`\ndelivered code vs the definition of done: ${deliveredScore}/3 → NOT done, known before your customers know`)
assert.equal(deliveredScore, 1) // the happy path is the only check it passes

function checkoutTotalV2(cart, promoCode) {
  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0)
  const rate = PROMOS[promoCode.trim().toUpperCase()]
  if (rate === undefined) return { total: subtotal, applied: false }
  return { total: subtotal - subtotal * rate, applied: true }
}
const fixedScore = judge(checkoutTotalV2)
console.log(`fixed code vs the same definition of done: ${fixedScore}/3 → done is a fact, rerunnable forever`)
assert.equal(fixedScore, 3)

// ---------- the pace calculator: a real "Done!" delivery vs its checks ----------
// pace.js worked when tried once. Extract paceFor and run the paths nobody ran:
const loadPaceFor = (file) =>
  new Function(readFileSync(join(here, file), 'utf8') + '\nreturn { paceFor };')().paceFor

const paceBefore = loadPaceFor('pace.js')
console.log(`\npace.js, the delivery that "worked": paceFor(3.1, '25:00') → '${paceBefore(3.1, '25:00')}'`)
assert.equal(paceBefore(3.1, '25:00'), '8:04 per mile') // the one point anyone checked

const hmmss = paceBefore(6.2, '1:02:00')
const carry = paceBefore(3, '23:59')
const zero = paceBefore(0, '25:00')
console.log(`the paths nobody ran: 1:02:00 race → '${hmmss}' | 23:59 → '${carry}' | distance 0 → '${zero}'`)
assert.equal(hmmss, '0:10 per mile') // an hour-long race silently read as 62 seconds
assert.equal(carry, '7:60 per mile') // rounding never carries — confident nonsense
assert.equal(zero, 'Infinity:NaN per mile') // garbage, delivered without an error

// The definition of done, as a rerunnable checks file with an exit-code contract:
const beforeRun = spawnSync(process.execPath, ['pace-checks.mjs', 'pace.js'], { cwd: here, encoding: 'utf8' })
const afterRun = spawnSync(process.execPath, ['pace-checks.mjs', 'pace-fixed.js'], { cwd: here, encoding: 'utf8' })
const score = (r) => r.stdout.match(/(\d+)\/23 checks passed/)?.[1]
console.log(`\npace-checks.mjs vs pace.js:       ${score(beforeRun)}/23 (exit ${beforeRun.status})`)
console.log(`pace-checks.mjs vs pace-fixed.js: ${score(afterRun)}/23 (exit ${afterRun.status})`)
assert.equal(beforeRun.status, 1)
assert.equal(score(beforeRun), '8') // the delivery passes 8 of its own 23 checks
assert.equal(afterRun.status, 0)
assert.equal(score(afterRun), '23')

console.log(`\nclaims hold: "it works" was one point in the space; the checks are the region, and they are rerunnable.`)
