// The lead-magnet lesson's claim, executed:
//   before — four jobs (pricing, tax, email, save) share one `total` variable;
//     the reasonable request "make the 10% discount apply to shipping too",
//     applied as a one-line edit to the discount line, silently breaks the tax,
//     the email, and the charge.
//   after — the same request lands as one line inside the pricing part and
//     physically cannot reach tax or the email.
// Exit 0 iff both claims hold when actually run.
import assert from 'node:assert/strict'
import { updateOrder as updateOrderBefore } from './order.js'
import { updateOrder as updateOrderAfter } from './order-fixed.js'

const cents = (n) => Math.round(n * 100)
const capture = () => {
  const io = { emails: [], saved: [] }
  io.sendEmail = (user, msg) => io.emails.push(msg)
  io.save = (rec) => io.saved.push(rec)
  return io
}

const order = {
  user: 'sam',
  items: [{ price: 60 }, { price: 40 }], // $100 of items
  coupon: true,
  shipping: 10,
}

// ---------- baseline: the broken file, before anyone touches it ----------
const io0 = capture()
const baseline = updateOrderBefore(order, io0)
console.log(`BEFORE (untouched): total $${baseline.toFixed(2)} — works fine. It always works fine on day one.`)
assert.equal(cents(baseline), cents(90 + 90 * 0.08 + 10)) // $107.20 — correct today

// ---------- the trigger: "make the 10% discount apply to shipping too" ----------
// The AI edits the discount line — the line that does discounting. One line:
//
//   - if (order.coupon) total = total * 0.9
//   + if (order.coupon) total = (total + order.shipping) * 0.9
//
// It does not touch the `total += order.shipping` line 40 lines down, because
// that line is about shipping, not discounts. Here is the edited function:
function updateOrderEdited(order, io) {
  let total = 0
  for (const item of order.items) total += item.price
  if (order.coupon) total = (total + order.shipping) * 0.9 // ← the one-line edit
  const tax = total * 0.08
  total = total + tax
  total = total + order.shipping
  io.sendEmail(order.user, `You paid $${total.toFixed(2)}`)
  io.save({ ...order, total })
  return total
}

// What the request actually asked for: discount items AND shipping, tax policy untouched
const oracle = 100 * 0.9 + 100 * 0.9 * 0.08 + 10 * 0.9 // $106.20

const io1 = capture()
const broken = updateOrderEdited(order, io1)
console.log(`\nTrigger: "make the discount apply to shipping too" — one-line edit to the discount line.`)
console.log(`BEFORE (after the edit): charged $${broken.toFixed(2)}, should be $${oracle.toFixed(2)}`)

// One change, three breaks — each one asserted, not asserted-in-prose:
// 1. the charge is wrong (shipping now counted twice: once discounted+taxed, once raw)
assert.notEqual(cents(broken), cents(oracle))
assert.equal(cents(broken), cents(99 + 99 * 0.08 + 10)) // $116.92 — $10.72 over
// 2. the tax silently changed policy: it's no longer 8% of the discounted items
const taxCharged = broken - 99 - 10
assert.notEqual(cents(taxCharged), cents(90 * 0.08))
// 3. the email states the same wrong number the customer was charged
assert.equal(io1.emails[0], `You paid $${broken.toFixed(2)}`)
console.log(`  break 1 — shipping charged twice (once inside the discount, once on the old line)`)
console.log(`  break 2 — tax is now charged on shipping; nobody asked to change tax policy`)
console.log(`  break 3 — the email confirms the wrong charge: "${io1.emails[0]}"`)

// ---------- the after: same request, seamed shape ----------
// In order-fixed.js the request was also one line — inside priceShipping.
// Tax and email receive finished numbers; the edit cannot reach them.
const io2 = capture()
const fixed = updateOrderAfter(order, io2)
console.log(`\nAFTER (same request, applied in order-fixed.js): charged $${fixed.toFixed(2)}`)
assert.equal(cents(fixed), cents(oracle))
assert.equal(io2.emails[0], `You paid $${oracle.toFixed(2)}`)
assert.equal(cents(io2.saved[0].total), cents(oracle))

console.log('\nclaims hold: the before breaks in threes exactly as the lesson says; the after cannot.')
