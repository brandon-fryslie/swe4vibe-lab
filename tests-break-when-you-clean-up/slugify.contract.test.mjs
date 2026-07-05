// contract test suite for slugify — run with: node slugify.contract.test.mjs
// [LAW:behavior-not-structure] every assertion goes through the public surface
// (slugify in, string out); nothing here knows how the pipeline is built.
import { slugify } from './slugify.js'

let pass = 0, fail = 0
function test(name, fn) {
  try { fn(); pass++; console.log('PASS', name) }
  catch (e) { fail++; console.log('FAIL', name, '—', e.message) }
}
function expect(got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error('expected ' + JSON.stringify(want) + ', got ' + JSON.stringify(got))
}

// — behavior tests carried over unchanged from the original suite —

test('basic title becomes a slug', () => {
  expect(slugify('Hello, World!'), 'hello-world')
})

test('already-clean input passes through lowercased', () => {
  expect(slugify('Already-Slugged'), 'already-slugged')
})

// — contract rewrites of the structure tests —

// was: 'stripPunctuation is exported for testing' — asserted a helper exists.
// the contract that helper serves: punctuation never reaches the slug.
test('punctuation is removed from the slug', () => {
  expect(slugify('Rock & Roll: Vol. 2'), 'rock-roll-vol-2')
})

// was: 'slugify calls stripPunctuation exactly once' — call counts are not
// observable to a caller. the contract: no punctuation survives, even dense.
test('heavily punctuated titles come out fully clean', () => {
  expect(slugify('Wait... what?! (seriously?)'), 'wait-what-seriously')
})

// was: 'stripPunctuation runs before collapseWhitespace' — internal ordering.
// the observable consequence of that ordering: punctuation at the edges
// vanishes entirely instead of leaving stray leading/trailing dashes.
test('edge punctuation leaves no stray dashes', () => {
  expect(slugify('! Hello !'), 'hello')
})

// was: 'dedupeDashes receives the collapsed string' — spied on an argument.
// the contracts that dataflow produces: runs of whitespace become one dash,
// and dash pile-ups (spaces plus literal dashes) still collapse to one.
test('runs of whitespace collapse to a single dash', () => {
  expect(slugify('My  Big   Day'), 'my-big-day')
})

test('mixed dashes and spaces collapse to a single dash', () => {
  expect(slugify('a -- b'), 'a-b')
})

console.log(pass + ' passed, ' + fail + ' failed')
process.exit(fail === 0 ? 0 : 1)
