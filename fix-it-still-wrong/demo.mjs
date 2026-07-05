// The lesson's claim, executed:
//   before — `remaining` is a stored second copy of a fact `todos` already holds.
//     The reasonable request "add a way to delete a todo" forgets the copy, and
//     the badge lies. You fix deleteTodo — genuinely — and next month "mark all
//     done" ships and forgets too. The bug regenerates because the defect is the
//     copy, which taxes every update path, including the unwritten ones.
//   after — one home, everything else computed on read: no path can forget,
//     because there is nothing to remember.
// Then the same disease on the real specimen (inventory.js): writeOff desyncs
// the stored total and the low-stock list; inventory-fixed.js has no copies to desync.
// Exit 0 iff the claims hold when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- BEFORE: the badge is a second copy ----------
let todos = []
let remaining = 0 // ← a second copy of a fact `todos` already holds

const addTodo = (text) => { todos.push({ text, done: false }); remaining++ }
const toggleTodo = (i) => { todos[i].done = !todos[i].done; remaining += todos[i].done ? -1 : 1 }
const active = () => todos.filter((t) => !t.done).length

addTodo('milk'); addTodo('rent'); addTodo('gym')
toggleTodo(0)
console.log(`BEFORE baseline: list shows ${active()} active | badge says ${remaining} — in sync. It always starts in sync.`)
assert.equal(remaining, active())

// The reasonable request: "add a way to delete a todo." The AI writes:
function deleteTodo(i) { todos.splice(i, 1) }
deleteTodo(1) // delete "rent" (active)
console.log(`BEFORE after delete: list shows ${active()} active | badge says ${remaining} — the badge lies.`)
assert.equal(active(), 1)
assert.equal(remaining, 2) // ← the exact failure: one line, correct-looking, forgot the invisible job
assert.notEqual(remaining, active())

// You find it and genuinely fix it: delete now updates the counter.
function deleteTodoFixed(i) { const t = todos[i]; todos.splice(i, 1); if (!t.done) remaining-- }
addTodo('vacuum')
deleteTodoFixed(todos.length - 1)
console.log(`BEFORE with the fix in: list shows ${active()} active | badge says ${remaining} — fixed. Tested. Done.`)
assert.equal(remaining, 2) // (still carrying the stale +1 from the unfixed delete — the lie compounds quietly)

// Next month, "mark all done" ships — written without reading any of this:
function markAllDone() { for (const t of todos) t.done = true }
markAllDone()
console.log(`BEFORE after markAllDone: list shows ${active()} active | badge says ${remaining} — lying again, with your fix still sitting there.`)
assert.equal(active(), 0)
assert.notEqual(remaining, active()) // ← still wrong after a correct fix: the bug regenerates

// ---------- AFTER: one home, everything else computed ----------
let todos2 = []
const remaining2 = () => todos2.filter((t) => !t.done).length // computed on read; nothing stored

const addTodo2 = (text) => todos2.push({ text, done: false })
const toggleTodo2 = (i) => { todos2[i].done = !todos2[i].done }
const deleteTodo2 = (i) => todos2.splice(i, 1) // finished. Nothing to remember.
const markAllDone2 = () => { for (const t of todos2) t.done = true }

addTodo2('milk'); addTodo2('rent'); addTodo2('gym')
toggleTodo2(0)
deleteTodo2(1)
assert.equal(remaining2(), todos2.filter((t) => !t.done).length)
markAllDone2()
console.log(`AFTER same sequence: badge says ${remaining2()} — it asks the one home, every time.`)
assert.equal(remaining2(), 0)
console.log('AFTER: the badge cannot disagree with the list — no second value exists to do the disagreeing.')

// ---------- the real specimen: inventory.js vs inventory-fixed.js ----------
// inventory.js stores four copies (running total, hand-synced low-stock list,
// cart rows snapshotting price, per-mutator DOM writes). Two paths already forget.
const loadSpecimen = (file, expose) => {
  const els = { stockEl: {}, lowStockEl: {}, cartCountEl: {}, priceEls: { 1: {}, 2: {} } }
  const ctx = vm.createContext({ ...els })
  vm.runInContext(readFileSync(join(here, file), 'utf8') + `\n__state = ${expose}`, ctx)
  return ctx.__state
}

const sick = loadSpecimen('inventory.js',
  '{ receiveShipment, sell, writeOff, get products() { return products }, get totalStock() { return totalStock }, get lowStockIds() { return lowStockIds } }')
sick.receiveShipment(2, 5) // Tee: 8 → 13, off the low-stock list
sick.writeOff(2, 4)        // damaged Tees: 13 → 9 — writeOff forgets BOTH copies
const sickTruth = sick.products.reduce((s, p) => s + p.stock, 0)
console.log(`\nSPECIMEN inventory.js after writeOff: stored total ${sick.totalStock}, actual ${sickTruth}; low-stock list [${sick.lowStockIds}], actually low: [2]`)
assert.equal(sick.totalStock, 53)     // the stored copy
assert.equal(sickTruth, 49)           // the truth
assert.equal(sick.lowStockIds.length, 0) // Tee is at 9 — low — and the hand-synced list missed it

const fixed = loadSpecimen('inventory-fixed.js',
  '{ receiveShipment, sell, writeOff, get products() { return products }, totalStock, lowStockIds }')
fixed.receiveShipment(2, 5)
fixed.writeOff(2, 4)
const fixedTruth = fixed.products.reduce((s, p) => s + p.stock, 0)
console.log(`SPECIMEN inventory-fixed.js after writeOff: total() ${fixed.totalStock()}, actual ${fixedTruth}; lowStockIds() [${fixed.lowStockIds()}]`)
assert.equal(fixed.totalStock(), fixedTruth) // computed from the one home — cannot be stale
assert.deepEqual([...fixed.lowStockIds()], [2])

console.log('\nclaims hold: every stored copy in the before eventually lies; the after has nothing to forget.')
