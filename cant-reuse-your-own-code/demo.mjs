// The lesson's claim, executed:
//   before — validateSignupEmail is welded to its birthplace: it grabs the
//     signup page's elements and mixes rule-checking with error display.
//     (1) Moved to checkout, it throws — it cannot leave the room.
//     (2) So a copy gets minted, and when the rules change ("block plus
//         addresses") only the copy in view gets the edit: same input,
//         different verdicts on different pages.
//   after — one part that does one thing, completely, asking nothing serves
//     both pages, takes the rule change exactly once, and runs with no DOM at all.
// Then the same disease on the real module (booking.js): its calculators
// grab their page by element id and cannot run anywhere else; the pure pricing
// core in booking-fixed.js runs right here, DOM-free.
// Exit 0 iff the claims hold when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const input = 'x+spam@mail.com'

// ---------- BEFORE ----------
{
  // the signup page: ONLY signup's elements exist
  const elements = {
    'signup-email': { value: input },
    'signup-error': { textContent: '' },
  }
  const signupDocument = { getElementById: (id) => elements[id] ?? null }

  // claim 1: reuse it on the checkout page — no signup-* elements there
  const checkoutDocument = { getElementById: () => null }
  function validateSignupEmailOnCheckout() {
    const email = checkoutDocument.getElementById('signup-email').value
    return email.includes('@')
  }
  assert.throws(validateSignupEmailOnCheckout, TypeError)
  console.log('BEFORE, moved to checkout: THROWS TypeError — the function cannot leave the room it was born in.')

  // claim 2: so you copy-paste. Months later, "block plus-addresses" lands
  // on the copy the AI was shown — signup's — and nowhere else.
  function validateSignupEmailV2(email) {
    if (!email.includes('@') || email.length < 6) return false
    if (email.includes('+')) return false // ← the new rule, applied here only
    return true
  }
  function validateCheckoutEmail(email) {
    if (!email.includes('@') || email.length < 6) return false
    return true // ← the copy nobody remembered
  }
  const signupVerdict = validateSignupEmailV2(input)
  const checkoutVerdict = validateCheckoutEmail(input)
  console.log(`BEFORE, rule change: signup says ${signupVerdict} | checkout says ${checkoutVerdict} — same input, two verdicts, nobody chose that.`)
  assert.equal(signupVerdict, false)
  assert.equal(checkoutVerdict, true) // ← the exact failure: one rule, two truths
  void signupDocument
}

// ---------- AFTER ----------
// one thing, completely, asking nothing: value in, verdict out
function emailProblem(email) {
  if (!email.includes('@') || email.length < 6) return 'Enter a valid email'
  if (email.includes('+')) return 'Plus addresses are not allowed'
  return null
}

// both pages are one-line edges over the same part
const signupCheck = (value) => emailProblem(value)
const checkoutCheck = (value) => emailProblem(value)
assert.equal(signupCheck(input), checkoutCheck(input)) // verdicts agree everywhere, forever
assert.equal(signupCheck(input), 'Plus addresses are not allowed')
assert.equal(typeof globalThis.document, 'undefined') // no DOM anywhere in this script
console.log(`AFTER, rule change (made once): both pages say ${JSON.stringify(signupCheck(input))} — and it just ran with no DOM in sight.`)

// ---------- the real module: booking.js vs booking-fixed.js ----------
// booking.js's calculators grab 'sat-hours' etc. from their page. On any other
// page — or here, in plain Node — they throw.
const loadModule = (file, expose) => {
  const ctx = vm.createContext({ document: { getElementById: () => null }, fetch: () => {} })
  vm.runInContext(readFileSync(join(here, file), 'utf8') + `\n__state = ${expose}`, ctx)
  return ctx.__state
}

const broken = loadModule('booking.js', '{ calcSaturdayInvoice }')
assert.throws(broken.calcSaturdayInvoice, (e) => e.name === 'TypeError') // vm realm: match by name
console.log('\nBROKEN booking.js off its page: calcSaturdayInvoice() THROWS — the whole room has to come with it.')

const fixedParts = loadModule('booking-fixed.js', '{ computeSubtotal, computeInvoiceTotal }')
const subtotal = fixedParts.computeSubtotal({ hours: 4, guests: 60, isSunday: false })
assert.equal(subtotal, 4 * 150 + 10 * 4) // $640, computed with zero DOM
console.log(`FIXED booking-fixed.js off its page: computeSubtotal(...) = $${subtotal} — inputs in, number out, runs anywhere.`)

console.log('\nclaims hold: the welded before cannot move and its copies drift; the after does one thing, completely, asking nothing.')
