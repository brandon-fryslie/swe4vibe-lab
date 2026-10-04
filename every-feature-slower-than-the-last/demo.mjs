// The lesson's claim, executed. Carrying cost is an ECONOMIC failure, so the
// evidence is a cost curve:
//   before (booking app, welded near-copies):
//     request 1 "add holiday pricing 1.5×" → the file has taught the AI its
//       pattern (one function per day type), so it mints a FOURTH copy; the
//       quote widget can't even say "holiday", so quote and invoice disagree.
//     request 2 "add a $75 cleaning fee to every booking" → the rule now lives
//       in four places; the AI updates the three it can see and misses the copy
//       it minted itself. Holiday bookings silently skip the fee.
//     The edit bill went UP: request 1 touched 3 places, request 2 touched 4.
//   after (one pricing home): request 1 = one value, request 2 = one line;
//     quote and invoice cannot disagree; the curve is flat.
// Then the real module (shipping.js / shipping-fixed.js): the fixed version has
// already taken its next feature — a 6% fuel surcharge — as ONE line, and a
// full input grid proves it landed on every price, every method, every copy.
// Exit 0 iff the claims hold when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cents = (n) => Math.round(n * 100)
const TAX = 1.0825

// ---------- BEFORE: the welded booking app, after both AI edits landed ----------
const elements = {
  'sat-hours': { value: '4' }, 'sat-guests': { value: '60' }, 'sat-total': { textContent: '' },
  'hol-hours': { value: '4' }, 'hol-guests': { value: '60' }, 'hol-total': { textContent: '' },
}
const document = { getElementById: (id) => elements[id] }

function calcSaturdayInvoice() {
  const hours = Number(document.getElementById('sat-hours').value)
  const guests = Number(document.getElementById('sat-guests').value)
  let total = hours * 150
  if (guests > 50) total += (guests - 50) * 4
  total += 75 // request 2: cleaning fee — updated
  total = total * TAX
  document.getElementById('sat-total').textContent = '$' + total.toFixed(2)
  return total
}

// request 1's new copy — #4 of the pricing rule
function calcHolidayInvoice() {
  const hours = Number(document.getElementById('hol-hours').value)
  const guests = Number(document.getElementById('hol-guests').value)
  let total = hours * 150 * 1.5
  if (guests > 50) total += (guests - 50) * 4
  // request 2: cleaning fee — MISSED. The AI updated the copies it was shown;
  // this one — the copy it wrote itself last round — wasn't in view.
  total = total * TAX
  document.getElementById('hol-total').textContent = '$' + total.toFixed(2)
  return total
}

function calcQuote(hours, guests, isSunday) {
  // copied from the invoice code for the quote widget -- keep in sync!
  let total = hours * 150
  if (isSunday) total = total * 1.25
  if (guests > 50) total += (guests - 50) * 4
  total += 75 // request 2: cleaning fee — updated
  return total
}

// Drift #1: quote a holiday booking. The quote widget's only knob is isSunday —
// a holiday isn't even sayable there — so the customer is quoted the weekday rate.
const quoted = calcQuote(4, 60, false)
const billed = calcHolidayInvoice() / TAX
console.log(`BEFORE drift #1 — same holiday booking: quoted $${quoted.toFixed(2)}, billed $${billed.toFixed(2)} pre-tax.`)
assert.equal(cents(quoted), cents(715)) // the lesson's numbers, re-executed
assert.equal(cents(billed), cents(940))
assert.notEqual(cents(quoted), cents(billed))

// Drift #2: the cleaning fee. Saturday has it; the holiday copy never got it.
const satPreTax = calcSaturdayInvoice() / TAX
console.log(`BEFORE drift #2 — $75 cleaning fee "on every booking": saturday $${satPreTax.toFixed(2)} (fee in), holiday $${billed.toFixed(2)} (fee silently missing).`)
assert.equal(cents(satPreTax), cents(715)) // 640 base + 75 fee
assert.equal(cents(billed), cents(940))    // 940 base + no fee — the miss, executed
console.log('BEFORE edit bill: request 1 → 3 places, request 2 → 4 places. Same-size asks, rising price. That is the curve.')

// ---------- AFTER: one pricing home ----------
const RATES = { weekday: 1, sunday: 1.25, holiday: 1.5 } // request 1: ONE value
const CLEANING_FEE = 75                                   // request 2: ONE line

function subtotal({ hours, guests, day }) {
  const extraGuests = Math.max(0, guests - 50) * 4
  return hours * 150 * RATES[day] + extraGuests + CLEANING_FEE
}
const quote = (booking) => subtotal(booking)
const invoice = (booking) => subtotal(booking) * TAX

const hol = { hours: 4, guests: 60, day: 'holiday' }
console.log(`AFTER same two requests: holiday quoted $${quote(hol).toFixed(2)}, billed $${(invoice(hol) / TAX).toFixed(2)} pre-tax — they cannot disagree.`)
assert.equal(cents(quote(hol)), cents(1015)) // the lesson's number: 900 + 40 + 75
assert.equal(cents(quote(hol)), cents(invoice(hol) / TAX))
console.log('AFTER edit bill: request 1 → 1 value, request 2 → 1 line. Flat.')

// ---------- the real module: the NEXT feature, landed once ----------
// shipping.js holds the pricing rule in four places (three calculators + the
// checkout copy marked "keep in sync!"). shipping-fixed.js is the same
// calculator with one pricing home — which has already taken the next feature,
// a 6% fuel surcharge, as one line. If that claim is true, every fixed price is
// exactly 1.06× the welded price: every method, every input, the checkout copy too.
const loadModule = (file) => {
  const els = {}
  const doc = { getElementById: (id) => (els[id] ??= { value: '0', textContent: '' }) }
  const ctx = vm.createContext({ document: doc })
  vm.runInContext(readFileSync(join(here, file), 'utf8') +
    '\n__fns = { calcStandardShipping, calcExpressShipping, calcOvernightShipping, checkoutShippingLine }', ctx)
  return { fns: ctx.__fns, doc }
}

const FUEL = 1.06
const calcNames = { standard: 'calcStandardShipping', express: 'calcExpressShipping', overnight: 'calcOvernightShipping' }
let checks = 0
for (const w of [0, 0.5, 1, 5, 19.99, 20, 20.01, 25, 100]) {
  for (const d of [0, 1, 50, 99.5, 100, 100.5, 101, 250, 5000]) {
    const a = loadModule('shipping.js')
    const b = loadModule('shipping-fixed.js')
    for (const x of [a, b]) {
      x.doc.getElementById('pkg-weight').value = String(w)
      x.doc.getElementById('pkg-distance').value = String(d)
    }
    for (const m of ['standard', 'express', 'overnight']) {
      const before = a.fns[calcNames[m]]()
      const after = b.fns[calcNames[m]]()
      assert.ok(Math.abs(after - before * FUEL) < 1e-9,
        `fuel surcharge missed ${m} at w=${w} d=${d}: ${before} → ${after}`)
      assert.equal(b.fns.checkoutShippingLine(w, d, m), '$' + (before * FUEL).toFixed(2))
      checks += 2
    }
  }
}
console.log(`\nFIXED shipping-fixed.js: the 6% fuel surcharge (one line) landed on every price — ${checks} checks across the input grid, zero copies missed.`)
console.log('In shipping.js the same feature is four separate edits — with a miss chance on each. You just watched what the miss does.')

console.log('\nclaims hold: the welded shape bills every feature to every copy; the one-home shape takes features as single edits.')
