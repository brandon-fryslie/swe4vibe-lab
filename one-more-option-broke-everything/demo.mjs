// The lesson's claim, executed:
//   before — four checkout flags, each added as a reasonable request and each
//     CORRECT alone. But 4 flags = 16 programs wearing one function's name,
//     and only 5 were ever run. One combination (clearance + coupon on a
//     cheap cart) puts a negative total on screen with zero errors.
//   after — options become values (a discount list, a shipping fee) flowing
//     through ONE audited path: every healthy combo matches to the cent, and
//     the negative cell is impossible by construction.
//   specimen — traffic-report.js carries FIVE flags (32 programs) with two
//     meaning-shift interactions and a latent NaN% cell; the fixed version
//     translates flags to values at the boundary and reproduces all 32 combos
//     byte-identically (golden-32-combos.txt) — the tensions it preserves are
//     asserted below, decided by no one, now at least written down.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { week, report } from './traffic-report.js'
import { report as reportFixed } from './traffic-report-fixed.js'

const here = dirname(fileURLToPath(import.meta.url))
const money = (n) => '$' + n.toFixed(2)

// ---------- BEFORE: the flag pile, grown one reasonable request at a time ----------
function total(items, opts) {
  let sum = items.reduce((s, it) => s + it.price * it.qty, 0)
  if (opts.clearance) sum = sum * 0.60
  if (opts.member) sum = sum * 0.90
  if (opts.coupon) sum = sum - 10
  if (!opts.freeShipping) sum = sum + 6.99
  return sum
}

const normalCart = [{ price: 25, qty: 2 }]          // $50 of goods
const cheapCart  = [{ price: 5, qty: 3 }]           // $15 of goods

console.log('=== BEFORE: each request tested the way requests are tested ===')
// each flag alone is CORRECT — that's why nobody caught anything
assert.equal(money(total(normalCart, {})), '$56.99')
assert.equal(money(total(normalCart, { member: true })), '$51.99')
assert.equal(money(total(normalCart, { freeShipping: true })), '$50.00')
assert.equal(money(total(normalCart, { clearance: true })), '$36.99')
assert.equal(money(total(normalCart, { coupon: true })), '$46.99')
console.log('baseline $56.99 / member $51.99 / freeShipping $50.00 / clearance $36.99 / coupon $46.99 — all correct alone')

const FLAGS = ['clearance', 'member', 'coupon', 'freeShipping']
const combos = []
for (let mask = 0; mask < 16; mask++) {
  const opts = {}
  FLAGS.forEach((f, i) => { if (mask & (1 << i)) opts[f] = true })
  combos.push(opts)
}
console.log('\nconfigurations of this one function:', combos.length)
console.log('configurations anyone ever ran: 5 (baseline + each flag alone) — 11 shipped blind')

// the interaction bug fires ONLY in combination — asserted
const bad = combos.filter(opts => total(cheapCart, opts) < 0)
assert.ok(bad.length > 0)
assert.ok(total(cheapCart, { clearance: true }) > 0)
assert.ok(total(cheapCart, { coupon: true }) > 0)
const onScreen = 'Total: ' + money(total(cheapCart, { clearance: true, coupon: true, freeShipping: true }))
assert.equal(onScreen, 'Total: $-1.00')
console.log('\ncheap cart ($15): clearance alone fine, coupon alone fine — together on screen:', onScreen)

// ---------- AFTER: options are values flowing through one path ----------
function totalAfter(items, discounts, shippingFee) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  const afterDiscounts = discounts.reduce(
    (sum, d) => (d.percent ? sum * (1 - d.percent / 100) : sum - d.dollars),
    subtotal
  )
  const goods = Math.max(0, afterDiscounts) // decided once, in writing: goods never go below zero
  return goods + shippingFee
}

const asValues = (opts) => ({
  discounts: [
    ...(opts.clearance ? [{ name: 'Clearance', percent: 40 }] : []),
    ...(opts.member ? [{ name: 'Member', percent: 10 }] : []),
    ...(opts.coupon ? [{ name: 'SAVE10', dollars: 10 }] : []),
  ],
  shippingFee: opts.freeShipping ? 0 : 6.99,
})

function beforeGoods(items, opts) {
  let sum = items.reduce((s, it) => s + it.price * it.qty, 0)
  if (opts.clearance) sum = sum * 0.60
  if (opts.member) sum = sum * 0.90
  if (opts.coupon) sum = sum - 10
  return sum
}

let matches = 0, diseased = 0, negatives = 0
for (const opts of combos) {
  const { discounts, shippingFee } = asValues(opts)
  const beforeT = total(cheapCart, opts)
  const afterT = totalAfter(cheapCart, discounts, shippingFee)
  if (afterT < 0) negatives++
  if (beforeGoods(cheapCart, opts) >= 0) {
    if (Math.abs(beforeT - afterT) < 1e-9) matches++
  } else {
    diseased++
  }
}
console.log('\n=== AFTER: same 16 configurations as data through ONE path ===')
console.log(`healthy combos matching to the cent: ${matches} of ${16 - diseased}; diseased cells repaired: ${diseased}; negative totals possible: ${negatives}`)
assert.equal(matches, 16 - diseased)   // every healthy combo matches exactly
assert.ok(diseased > 0)                // the dark cells were real
assert.equal(negatives, 0)             // and no combination can go negative now

// ---------- the specimen: five flags, 32 programs, one golden ----------
const golden = readFileSync(join(here, 'golden-32-combos.txt'), 'utf8')
const digest = (file) => spawnSync(process.execPath, [join(here, 'golden.mjs'), './' + file], { cwd: here, encoding: 'utf8' })
const beforeRun = digest('traffic-report.js')
const afterRun = digest('traffic-report-fixed.js')
assert.equal(beforeRun.status, 0)
assert.equal(afterRun.status, 0)
assert.equal(beforeRun.stdout, golden)
assert.equal(afterRun.stdout, golden)
console.log('\nspecimen: all 32 flag combos of traffic-report.js and traffic-report-fixed.js match golden-32-combos.txt byte-for-byte')

// the preserved tensions — interactions no one designed, kept identical by the
// honest refactor and flagged instead of silently redefined:
const shareOf = (out, path) => out.split('\n').find(l => l.startsWith(path)).split(' | ')[2]
assert.equal(shareOf(report(week, { percents: true }), '/home'), '52%')
assert.equal(shareOf(report(week, { percents: true, topThree: true }), '/home'), '56%')
assert.ok(report(week, { totalRow: true }).endsWith('TOTAL | 7950'))
assert.ok(report(week, { totalRow: true, topThree: true }).endsWith('TOTAL | 7310'))
const zeroWeek = [{ path: '/a', visits: 0 }]
assert.ok(report(zeroWeek, { percents: true }).includes('NaN%'))
assert.ok(!report(zeroWeek, { percents: true, hideEmpty: true }).includes('NaN%'))
assert.equal(reportFixed(week, { percents: true, topThree: true }), report(week, { percents: true, topThree: true }))
console.log('preserved tensions, asserted: topThree silently changes what SHARE (52%→56%) and TOTAL (7950→7310) mean; a zero-visit report prints NaN% unless hideEmpty happens to mask it')

console.log('\nclaims hold: every option doubles the programs you ship; values through one path put the count back to 1.')
