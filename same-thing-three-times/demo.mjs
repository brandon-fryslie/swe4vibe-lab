// The lesson's claims, executed:
//   before — three near-copy builders whose sameness is enforced by nothing;
//     the copies have ALREADY drifted (the error card lost the dismiss button),
//     and a new variant inherits the quirks of whichever copy it was cloned from.
//   after — one function + a table of named instances: a new kind is a row, and
//     a kind physically cannot lack a feature (one code path to have it).
//   module — alerts-fixed.js collapses alerts.js the same way and is
//     output-identical for every channel, including at the truncation edges.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// ---------- the drift, watched live (the lesson's card builders) ----------
function makeInfoCard(message) {
  return '<div class="card card-info">' +
         '<span class="icon">i</span>' +
         '<strong>Heads up</strong>' +
         '<p>' + message + '</p>' +
         '<button class="dismiss">x</button>' +
         '</div>'
}
function makeWarningCard(message) {
  return '<div class="card card-warning">' +
         '<span class="icon">!</span>' +
         '<strong>Careful</strong>' +
         '<p>' + message + '</p>' +
         '<button class="dismiss">x</button>' +
         '</div>'
}
// minted in an earlier session, before dismiss buttons existed — never caught up
function makeErrorCard(message) {
  return '<div class="card card-error">' +
         '<span class="icon">X</span>' +
         '<strong>Something broke</strong>' +
         '<p>' + message + '</p>' +
         '</div>'
}
// the trigger: "add a success card" — the AI clones the nearest example (error)
function makeSuccessCard(message) {
  return '<div class="card card-success">' +
         '<span class="icon">OK</span>' +
         '<strong>All good</strong>' +
         '<p>' + message + '</p>' +
         '</div>'
}

const hasDismiss = (html) => html.includes('class="dismiss"')
console.log('BEFORE — can each card be dismissed?')
console.log('  info:', hasDismiss(makeInfoCard('m')),
            '| warning:', hasDismiss(makeWarningCard('m')),
            '| error:', hasDismiss(makeErrorCard('m')),
            '| success (new):', hasDismiss(makeSuccessCard('m')))
assert.equal(hasDismiss(makeInfoCard('m')), true)
assert.equal(hasDismiss(makeWarningCard('m')), true)
assert.equal(hasDismiss(makeErrorCard('m')), false)      // the drift, already shipped
assert.equal(hasDismiss(makeSuccessCard('m')), false)    // the new card inherited it
console.log('  → the new card inherited the missing button from the copy it was cloned from.')

// ---------- after: one shape, the differences in a table ----------
const CARD_KINDS = {
  info:    { icon: 'i',  label: 'Heads up' },
  warning: { icon: '!',  label: 'Careful' },
  error:   { icon: 'X',  label: 'Something broke' },
  success: { icon: 'OK', label: 'All good' },   // ← the whole feature request
}
function makeCard(kind, message) {
  const { icon, label } = CARD_KINDS[kind]
  return '<div class="card card-' + kind + '">' +
         '<span class="icon">' + icon + '</span>' +
         '<strong>' + label + '</strong>' +
         '<p>' + message + '</p>' +
         '<button class="dismiss">x</button>' +
         '</div>'
}
for (const kind of Object.keys(CARD_KINDS)) assert.equal(hasDismiss(makeCard(kind, 'm')), true)
assert.equal(makeCard('info', 'm'), makeInfoCard('m'))       // correct kinds byte-identical
assert.equal(makeCard('warning', 'm'), makeWarningCard('m'))
console.log('AFTER — every kind dismissible; kinds that were right are byte-identical.')
console.log('  → a kind CANNOT lack a feature: there is only one card code path for it to have.')

// ---------- the module: alerts.js vs alerts-fixed.js, output-identical ----------
// The module files have no exports (they're the file as you'd find it);
// evaluate them and pull the builders out.
const load = (file) => {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
  return new Function(code + '\n;return { buildEmailAlert, buildSmsAlert, buildSlackAlert };')()
}
const before = load('./alerts.js')
const after = load('./alerts-fixed.js')

const cases = [
  ['db', 'connection pool exhausted'],
  ['api', 'x'.repeat(140)],   // crosses the SMS 160 limit
  ['queue', 'y'.repeat(380)], // crosses the Slack 400 limit
  ['batch', 'z'.repeat(600)], // crosses every limit
]
let checked = 0
for (const [service, message] of cases) {
  for (const fn of ['buildEmailAlert', 'buildSmsAlert', 'buildSlackAlert']) {
    assert.equal(after[fn](service, message), before[fn](service, message),
      `${fn} diverged for service=${service}`)
    checked++
  }
}
console.log(`\nexample: alerts-fixed.js is output-identical to alerts.js across ${checked} channel/input cases,`)
console.log('including the truncation edges — three functions were one function and a table all along.')

console.log('\nclaims hold: the copies drift exactly as the lesson says; the table cannot.')
