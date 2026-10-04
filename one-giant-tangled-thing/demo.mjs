// The lesson's claim, executed:
//   before — a trip-split app that is ONE part: parse + fold + derive + format
//     + print fused in a single function. It works as written. The reasonable
//     request "add the $4.50/person city tax" (share + 4.5) prints
//     "$126.674.5" and NaN balances, because `share` was a .toFixed STRING —
//     '-' coerced it (worked), '+' concatenates (garbage). No line is wrong;
//     the bug lives BETWEEN the jobs.
//   after — parts joined at seams: the tax is a value into computeSplit, the
//     numbers stay numbers, and "what's Jamie's balance?" is one call with
//     zero side effects.
//   module — workout-report.js is the same disease as a poke-able file; the
//     fixed pipeline produces byte-identical output (golden-output.txt) and
//     imports purely (no printing on import).
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderReport, log as workoutLog, GOAL_MIN } from './workout-report-fixed.js'

const here = dirname(fileURLToPath(import.meta.url))

const expenses = [
  { who: 'Sam',   what: 'cabin',     amount: 240 },
  { who: 'Jamie', what: 'groceries', amount: 87.3 },
  { who: 'Riley', what: 'gas',       amount: 52.7 },
]
const people = ['Sam', 'Jamie', 'Riley']

// ---------- BEFORE (blob), as first written ----------
function runTripSplitV1(log) {
  log('--- Trip Report ---')
  let total = 0
  const paid = {}
  for (const p of people) paid[p] = 0
  for (const e of expenses) {
    total += e.amount
    paid[e.who] += e.amount
    log(e.who + ' paid $' + e.amount + ' for ' + e.what)
  }
  const share = (total / people.length).toFixed(2)   // keep the numbers clean
  log('Everyone owes $' + share)
  for (const p of people) {
    const balance = paid[p] - share                   // '-' coerces the string: works
    log(p + (balance >= 0 ? ' is owed $' : ' owes $') + Math.abs(balance).toFixed(2))
  }
}

// ---------- BEFORE + trigger: "add the $4.50/person city tax" ----------
// The AI's minimal edit: shareWithTax = share + 4.5, printed and used below.
function runTripSplitV2(log) {
  log('--- Trip Report ---')
  let total = 0
  const paid = {}
  for (const p of people) paid[p] = 0
  for (const e of expenses) {
    total += e.amount
    paid[e.who] += e.amount
    log(e.who + ' paid $' + e.amount + ' for ' + e.what)
  }
  const share = (total / people.length).toFixed(2)
  const shareWithTax = share + 4.5                    // '+' on a string: concatenation
  log('Everyone owes $' + shareWithTax)
  for (const p of people) {
    const balance = paid[p] - shareWithTax            // '-' on '126.674.5': NaN
    log(p + (balance >= 0 ? ' is owed $' : ' owes $') + Math.abs(balance).toFixed(2))
  }
}

const capture = () => { const lines = []; return [lines, (s) => lines.push(s)] }

const [v1lines, v1log] = capture()
runTripSplitV1(v1log)
console.log('BEFORE, as written — works fine:')
v1lines.forEach(s => console.log('  ' + s))
assert.ok(v1lines.includes('Everyone owes $126.67'))
assert.ok(v1lines.some(s => s.startsWith('Sam is owed $113.33')))

const [v2lines, v2log] = capture()
runTripSplitV2(v2log)
console.log('\nBEFORE + one reasonable request ("add the $4.50 city tax"):')
v2lines.forEach(s => console.log('  ' + s))
// the claimed failure, asserted: string concat on screen, NaN in every balance
assert.ok(v2lines.some(s => s.includes('$126.674.5')))
assert.equal(v2lines.filter(s => s.includes('NaN')).length, 3)

// ---------- AFTER: parts, joined at seams ----------
const TAX_PER_PERSON = 4.5

function computeSplit(expenses, people, taxPerPerson) {
  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const paid = Object.fromEntries(people.map(p => [p, 0]))
  for (const e of expenses) paid[e.who] += e.amount
  const share = total / people.length + taxPerPerson
  return people.map(p => ({ person: p, paid: paid[p], share, balance: paid[p] - share }))
}

const money = (n) => '$' + Math.abs(n).toFixed(2)

function renderTripReport(rows, expenses, log) {
  log('--- Trip Report ---')
  for (const e of expenses) log(e.who + ' paid ' + money(e.amount) + ' for ' + e.what)
  log('Everyone owes ' + money(rows[0].share))
  for (const r of rows) log(r.person + (r.balance >= 0 ? ' is owed ' : ' owes ') + money(r.balance))
}

const rows = computeSplit(expenses, people, TAX_PER_PERSON)
const [afterLines, afterLog] = capture()
renderTripReport(rows, expenses, afterLog)
console.log('\nAFTER (same tax request, tax is a value; formatting only at the edge):')
afterLines.forEach(s => console.log('  ' + s))
assert.ok(rows.every(r => Number.isFinite(r.balance) && Number.isFinite(r.share)))

// one-call answer, no side effects, no report run:
const jamie = computeSplit(expenses, people, TAX_PER_PERSON).find(r => r.person === 'Jamie')
assert.equal(jamie.balance.toFixed(2), '-43.87')
console.log('\nOne-call answer — "what\'s Jamie\'s balance?":', jamie.balance.toFixed(2),
  '(no printing, no running the app)')
console.log('runnable-alone pieces: before 1 (the whole app) / after 3 (computeSplit, money, renderTripReport)')

// ---------- the module: workout-report.js / workout-report-fixed.js ----------
const golden = readFileSync(join(here, 'golden-output.txt'), 'utf8').trimEnd()

// the blob: its only runnable piece is the whole app, effects included
const blob = spawnSync(process.execPath, [join(here, 'workout-report.js')], { encoding: 'utf8' })
assert.equal(blob.status, 0)
assert.equal(blob.stdout.trimEnd(), golden)

// the pipeline: byte-identical output, but as a pure value from one call
assert.equal(renderReport(workoutLog, GOAL_MIN), golden)

// import purity: loading the fixed module prints nothing
const pure = spawnSync(process.execPath,
  ['--input-type=module', '-e', `await import(${JSON.stringify(join(here, 'workout-report-fixed.js'))}); console.log('PURE')`],
  { encoding: 'utf8' })
assert.equal(pure.stdout, 'PURE\n')

console.log('\nexample: blob output === pipeline output === golden-output.txt, and the pipeline imports without printing')
console.log('\nclaims hold: the blob works until the first edit lands between its fused jobs; the parts version cannot break that way.')
