// The lesson's 2x2 matrix, executed twice — once inline on a cart module, once
// on the real slugify specimen in this directory:
//   a STRUCTURE suite (spies, helper-existence, call counts) goes RED on a
//   behavior-preserving cleanup and stays GREEN on a real bug; a BEHAVIOR
//   suite (the contract) does exactly the opposite. Wrong in both directions.
// Exit 0 iff every cell of both matrices lands where the lesson says.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- matrix 1: the cart module, inline ----------
// V1: as the AI delivered it (helper "exported for testing")
function makeV1() {
  const internals = { itemTotal(item) { return item.price * item.qty } }
  function cartTotal(cart) {
    let sum = 0
    for (const item of cart) sum += internals.itemTotal(item)
    return sum
  }
  return { cartTotal, internals }
}
// V2: the cleanup — same behavior, helper inlined
function makeV2() {
  return { cartTotal: (cart) => cart.reduce((s, i) => s + i.price * i.qty, 0), internals: undefined }
}
// V3: a real bug, structure faithfully preserved — itemTotal forgot qty
function makeV3() {
  const internals = { itemTotal(item) { return item.price } }
  function cartTotal(cart) {
    let sum = 0
    for (const item of cart) sum += internals.itemTotal(item)
    return sum
  }
  return { cartTotal, internals }
}

const structureSuite = [
  (m) => { if (typeof m.internals?.itemTotal !== 'function') throw new Error('itemTotal missing') },
  (m) => {
    const real = m.internals.itemTotal
    let calls = 0
    m.internals.itemTotal = (item) => { calls++; return real(item) }
    m.cartTotal([{ price: 1, qty: 1 }, { price: 2, qty: 1 }, { price: 3, qty: 1 }])
    m.internals.itemTotal = real
    if (calls !== 3) throw new Error('expected 3 calls, got ' + calls)
  },
  (m) => {
    const real = m.internals.itemTotal
    const seen = []
    m.internals.itemTotal = (item) => { seen.push(item); return real(item) }
    const cart = [{ price: 1, qty: 1 }, { price: 2, qty: 5 }]
    m.cartTotal(cart)
    m.internals.itemTotal = real
    if (JSON.stringify(seen) !== JSON.stringify(cart)) throw new Error('call args differ')
  },
]
const behaviorSuite = [
  (m) => { if (m.cartTotal([]) !== 0) throw new Error('empty cart') },
  (m) => { if (m.cartTotal([{ price: 40, qty: 2 }]) !== 80) throw new Error('$40 x 2') },
  (m) => { if (m.cartTotal([{ price: 40, qty: 2 }, { price: 15, qty: 1 }, { price: 5, qty: 4 }]) !== 115) throw new Error('mixed cart') },
]
const run = (suite, make) => suite.filter((fn) => { try { fn(make()); return true } catch { return false } }).length

const cartMatrix = {}
for (const [code, make] of [['original', makeV1], ['cleanup', makeV2], ['bug', makeV3]]) {
  cartMatrix[code] = { structure: run(structureSuite, make), behavior: run(behaviorSuite, make) }
}
console.log('cart module — suite \\ code   original   honest cleanup   real bug (qty dropped)')
console.log(`structure suite                 ${cartMatrix.original.structure}/3        ${cartMatrix.cleanup.structure}/3              ${cartMatrix.bug.structure}/3`)
console.log(`behavior suite                  ${cartMatrix.original.behavior}/3        ${cartMatrix.cleanup.behavior}/3              ${cartMatrix.bug.behavior}/3`)

// the whole atom in four cells:
assert.equal(cartMatrix.cleanup.structure, 0) // red on the change that broke nothing
assert.equal(cartMatrix.bug.structure, 3) // green on the change that broke everything
assert.equal(cartMatrix.cleanup.behavior, 3) // silent on the cleanup
assert.equal(cartMatrix.bug.behavior, 1) // loud on the bug
assert.equal(cartMatrix.original.structure, 3)
assert.equal(cartMatrix.original.behavior, 3)

// ---------- matrix 2: the slugify specimen, suites actually spawned ----------
// Assemble each probe (a slugify.js variant + both real suites) in a temp dir
// and run the suites as processes — exit codes are the contract.
const runSuites = (variantDir) => {
  const dir = mkdtempSync(join(tmpdir(), 'slugify-probe-'))
  try {
    copyFileSync(join(here, variantDir, 'slugify.js'), join(dir, 'slugify.js'))
    copyFileSync(join(here, 'slugify.test.mjs'), join(dir, 'slugify.test.mjs'))
    copyFileSync(join(here, 'slugify.contract.test.mjs'), join(dir, 'slugify.contract.test.mjs'))
    const structure = spawnSync(process.execPath, ['slugify.test.mjs'], { cwd: dir, encoding: 'utf8' })
    const contract = spawnSync(process.execPath, ['slugify.contract.test.mjs'], { cwd: dir, encoding: 'utf8' })
    return { structure, contract }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const original = runSuites('.')
const refactor = runSuites('probe-refactor')
const bug = runSuites('probe-bug')

console.log('\nslugify specimen — old suite (4 of 6 tests are structure) vs contract suite:')
console.log(`  original module:            old suite exit ${original.structure.status}, contract exit ${original.contract.status}`)
console.log(`  behavior-preserving refactor: old suite exit ${refactor.structure.status} (dies demanding the deleted export), contract exit ${refactor.contract.status}`)
console.log(`  planted bug (lowercase dropped): old suite exit ${bug.structure.status}, contract exit ${bug.contract.status} — but look closer:`)

assert.equal(original.structure.status, 0)
assert.equal(original.contract.status, 0)
// the refactor keeps every promise — the contract stays green; the old suite
// won't even RUN until the deleted internals come back
assert.equal(refactor.contract.status, 0)
assert.notEqual(refactor.structure.status, 0)
assert.match(refactor.structure.stderr, /internals/)
// the bug breaks real behavior — the contract lights up 6 of 7 red...
assert.notEqual(bug.contract.status, 0)
assert.equal((bug.contract.stdout.match(/^FAIL/gm) ?? []).length, 6)
// ...while every spy-style photograph of the wiring stays green on wrong answers
for (const name of [
  'stripPunctuation is exported for testing',
  'slugify calls stripPunctuation exactly once',
  'stripPunctuation runs before collapseWhitespace',
]) {
  assert.match(bug.structure.stdout, new RegExp('PASS ' + name))
  console.log(`    PASS (on a real bug!) — ${name}`)
}

console.log('\nclaims hold: the structure suite is wrong in both directions; the contract suite is right in both.')
