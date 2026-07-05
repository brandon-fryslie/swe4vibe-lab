// The lesson's claim, executed:
//   before — compute, screen, and save are fused in one function around one
//     shared cart object. The harmless request "show the total with two
//     decimals" lands on the shared copy: the database receives a string, and
//     the next add-to-cart glues text to number — "45.0012.5" — on the screen
//     AND in the saved order.
//   after — the math is pure and each edge formats its own copy; the same
//     display edit physically cannot reach the saved value.
// Exit 0 iff both claims hold when actually run.
import assert from 'node:assert/strict'

// fake world
const screen = { text: null }
let savedPayloads = []
const fakePut = async (body) => { savedPayloads.push(JSON.parse(body)) }

// ---------- BEFORE (with the AI's display edit applied) ----------
const cart = { items: [{ price: 20 }, { price: 30 }], total: 0 }

async function updateCart(code) {
  cart.total = 0
  for (const item of cart.items) cart.total += item.price
  if (code === 'SAVE10') cart.total = cart.total - cart.total * 0.10
  cart.total = cart.total.toFixed(2) // ← the "just round it on screen" edit
  screen.text = '$' + cart.total
  await fakePut(JSON.stringify(cart))
}

await updateCart('SAVE10')
console.log('BEFORE, after the display edit:')
console.log('  screen:', screen.text)
console.log('  saved total:', JSON.stringify(savedPayloads.at(-1).total),
  '→ type:', typeof savedPayloads.at(-1).total)

// claim: the display tweak reached the database — the saved total is a string
assert.equal(typeof savedPayloads.at(-1).total, 'string')
assert.equal(savedPayloads.at(-1).total, '45.00')

// customer adds a $12.50 item — the other common fused path adjusts the
// running total in place, on the same shared object
cart.items.push({ price: 12.50 })
cart.total += 12.5 // "45.00" + 12.5 → string concatenation
screen.text = '$' + cart.total
await fakePut(JSON.stringify(cart))
console.log('  after add-to-cart: screen:', screen.text,
  '| saved total:', JSON.stringify(savedPayloads.at(-1).total))

// claim: glued garbage, on screen and in the saved order
assert.equal(screen.text, '$45.0012.5')
assert.equal(savedPayloads.at(-1).total, '45.0012.5')

// ---------- AFTER: figure out is pure; the edges touch the world ----------
// [LAW:effects-at-boundaries] the core computes, touches nothing; edges act, decide nothing
function cartTotal(items, code) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const discount = code === 'SAVE10' ? subtotal * 0.10 : 0
  return { subtotal, discount, total: subtotal - discount }
}

function showCart(totals) {
  screen.text = '$' + totals.total.toFixed(2) // the display request lands HERE, on a copy
}

async function saveCart(items, totals) {
  await fakePut(JSON.stringify({ items, total: totals.total }))
}

savedPayloads = []
const items = [{ price: 20 }, { price: 30 }]
let totals = cartTotal(items, 'SAVE10')
showCart(totals)
await saveCart(items, totals)
console.log('\nAFTER, same display edit:')
console.log('  screen:', screen.text)
console.log('  saved total:', JSON.stringify(savedPayloads.at(-1).total),
  '→ type:', typeof savedPayloads.at(-1).total)

// claim: the screen is formatted, the saved value is still a number
assert.equal(screen.text, '$45.00')
assert.equal(typeof savedPayloads.at(-1).total, 'number')
assert.equal(savedPayloads.at(-1).total, 45)

items.push({ price: 12.50 })
totals = cartTotal(items, 'SAVE10')
showCart(totals)
await saveCart(items, totals)
console.log('  after add-to-cart: screen:', screen.text,
  '| saved total:', JSON.stringify(savedPayloads.at(-1).total))

// claim: the database holds 56.25, a number, no matter how the display edit went
assert.equal(screen.text, '$56.25')
assert.equal(typeof savedPayloads.at(-1).total, 'number')
assert.equal(savedPayloads.at(-1).total, 56.25)

console.log('\nclaims hold: the before saves the display decision to the database;')
console.log('the after has no shared variable left to smuggle it through.')
