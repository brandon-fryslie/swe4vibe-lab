// The lesson's claim, executed:
//   before — the "money is integer cents" rule lived in session 1's chat.
//     Session 2 starts from zero, reads the code, sees `amount`, and adds a
//     $4.99 rush fee as 4.99. Nothing objects: the order silently totals
//     3603.99 "cents" and the customer is charged $36.04 — the rush fee
//     became five cents, no error anywhere.
//   after — the rule is encoded in the repo (name + one enforcing gate),
//     which is the only memory the next session gets. The identical
//     session-2 guess now throws immediately, with the fix in the message.
// Exit 0 iff both claims hold when actually run.
import assert from 'node:assert/strict'
import * as chatOnly from './billing.js'
import * as encoded from './billing-fixed.js'

const chargedDollars = (totalCents) => (totalCents / 100).toFixed(2)

// ---------- BEFORE: the rule lived in the chat, and the chat is gone ----------
const order = chatOnly.newOrder()
chatOnly.addItem(order, 'hoodie', 2500) // session 1 code: cents, as agreed
chatOnly.addItem(order, 'stickers', 1100)
chatOnly.addRushFee(order) // session 2's guess: 4.99 dollars, into a cents world

const total = chatOnly.orderTotal(order)
console.log('BEFORE (rule lived in the chat):')
console.log(`  order total: ${total} "cents"`)
console.log(`  customer charged: $${chargedDollars(total)} — rush fee became 5 cents`)

// claim: the violating write was accepted silently and the total is garbage
assert.equal(total, 3604.99)
assert.equal(chargedDollars(total), '36.05') // should have been $40.99
assert.notEqual(chargedDollars(total), '40.99')

// ---------- AFTER: the rule is encoded in the repo ----------
// [LAW:one-source-of-truth] the chat is a cache that evaporates; the repo is
// the only memory that survives the session, so the rule lives there.
const order2 = encoded.newOrder()
encoded.addItem(order2, 'hoodie', 2500)
encoded.addItem(order2, 'stickers', 1100)

console.log('\nAFTER (rule encoded in the repo), same session-2 guess:')
// claim: the identical guess cannot land — it throws, loudly, with the fix
assert.throws(
  () => encoded.addItem(order2, 'rush-fee', 4.99),
  (err) => {
    console.log(`  addItem(order, 'rush-fee', 4.99) → ${err.constructor.name}:`)
    console.log(`    "${err.message}"`)
    return err instanceof TypeError && /integer cents/.test(err.message)
  }
)

// ...and the corrected write (the message said how) works, to the penny
encoded.addItem(order2, 'rush-fee', 499)
const total2 = encoded.orderTotal(order2)
console.log(`  addItem(order, 'rush-fee', 499) → total ${total2} cents = $${chargedDollars(total2)}`)
assert.equal(total2, 4099)
assert.equal(chargedDollars(total2), '40.99')

console.log('\nclaims hold: the chat-held rule let the violating write through')
console.log('silently; the repo-held rule rejected it with the fix attached.')
