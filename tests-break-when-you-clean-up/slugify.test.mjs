// test suite for slugify — run with: node slugify.test.mjs
import { slugify, internals } from './slugify.js'

let pass = 0, fail = 0
function test(name, fn) {
  try { fn(); pass++; console.log('PASS', name) }
  catch (e) { fail++; console.log('FAIL', name, '—', e.message) }
}
function expect(got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error('expected ' + JSON.stringify(want) + ', got ' + JSON.stringify(got))
}

test('basic title becomes a slug', () => {
  expect(slugify('Hello, World!'), 'hello-world')
})

test('already-clean input passes through lowercased', () => {
  expect(slugify('Already-Slugged'), 'already-slugged')
})

test('stripPunctuation is exported for testing', () => {
  expect(typeof internals.stripPunctuation, 'function')
})

test('slugify calls stripPunctuation exactly once', () => {
  const real = internals.stripPunctuation
  let calls = 0
  internals.stripPunctuation = (s) => { calls++; return real(s) }
  slugify('Some Title')
  internals.stripPunctuation = real
  expect(calls, 1)
})

test('stripPunctuation runs before collapseWhitespace', () => {
  const order = []
  const realStrip = internals.stripPunctuation
  const realCollapse = internals.collapseWhitespace
  internals.stripPunctuation = (s) => { order.push('strip'); return realStrip(s) }
  internals.collapseWhitespace = (s) => { order.push('collapse'); return realCollapse(s) }
  slugify('A B')
  internals.stripPunctuation = realStrip
  internals.collapseWhitespace = realCollapse
  expect(order, ['strip', 'collapse'])
})

test('dedupeDashes receives the collapsed string', () => {
  const real = internals.dedupeDashes
  let arg = null
  internals.dedupeDashes = (s) => { arg = s; return real(s) }
  slugify('My  Big   Day')
  internals.dedupeDashes = real
  expect(arg, 'my-big-day')
})

console.log(pass + ' passed, ' + fail + ' failed')
process.exit(fail === 0 ? 0 : 1)
