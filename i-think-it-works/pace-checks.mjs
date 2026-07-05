// Acceptance checks for paceFor(distanceMiles, timeStr).
// Usage: node pace-checks.mjs <path-to-pace-js>   (defaults to ./pace.js)
// Exit code 0 = all checks pass, 1 = at least one failure. [LAW:verifiable-goals]

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const target = resolve(here, process.argv[2] ?? 'pace.js')

// The target is a plain script with no exports; load its source and pull
// paceFor out of the evaluated scope. Checks assert only on paceFor's
// observable behavior. [LAW:behavior-not-structure]
const src = readFileSync(target, 'utf8')
const { paceFor } = new Function(src + '\nreturn { paceFor };')()

const OK = /^\d+:[0-5]\d per mile$/ // every successful result must have this shape

const checks = [
  // --- normal cases ---
  { name: "documented example: paceFor(3.1, '25:00')", fn: () => paceFor(3.1, '25:00'), expect: '8:04 per mile' },
  { name: "exact pace, 1 mile: paceFor(1, '8:30')", fn: () => paceFor(1, '8:30'), expect: '8:30 per mile' },
  { name: "half-minute pace: paceFor(2, '15:00')", fn: () => paceFor(2, '15:00'), expect: '7:30 per mile' },
  { name: "minutes > 59 in MM:SS: paceFor(10, '85:00')", fn: () => paceFor(10, '85:00'), expect: '8:30 per mile' },
  { name: "fractional distance: paceFor(0.5, '3:30')", fn: () => paceFor(0.5, '3:30'), expect: '7:00 per mile' },
  { name: "pace under one minute: paceFor(2, '1:30')", fn: () => paceFor(2, '1:30'), expect: '0:45 per mile' },

  // --- weird but valid ---
  { name: "rounding must carry, never ':60': paceFor(3, '23:59')", fn: () => paceFor(3, '23:59'), expect: '8:00 per mile' },
  { name: "H:MM:SS input read correctly: paceFor(6.2, '1:02:00')", fn: () => paceFor(6.2, '1:02:00'), expect: '10:00 per mile' },

  // --- invalid inputs: must throw, never return garbage [LAW:no-silent-failure] ---
  { name: 'distance 0 throws', fn: () => paceFor(0, '25:00'), throws: true },
  { name: 'negative distance throws', fn: () => paceFor(-3, '25:00'), throws: true },
  { name: 'NaN distance throws', fn: () => paceFor(NaN, '25:00'), throws: true },
  { name: 'Infinity distance throws', fn: () => paceFor(Infinity, '25:00'), throws: true },
  { name: "string distance throws: paceFor('3.1', '25:00')", fn: () => paceFor('3.1', '25:00'), throws: true },
  { name: "time with no colon throws: '25'", fn: () => paceFor(3.1, '25'), throws: true },
  { name: "non-numeric time throws: 'abc'", fn: () => paceFor(3.1, 'abc'), throws: true },
  { name: 'empty-string time throws', fn: () => paceFor(3.1, ''), throws: true },
  { name: "seconds out of range throws: '25:75'", fn: () => paceFor(3.1, '25:75'), throws: true },
  { name: "single-digit seconds field throws: '25:4'", fn: () => paceFor(3.1, '25:4'), throws: true },
  { name: 'null time throws', fn: () => paceFor(3.1, null), throws: true },
  { name: 'numeric (non-string) time throws', fn: () => paceFor(3.1, 25), throws: true },
  { name: "zero elapsed time throws: '0:00'", fn: () => paceFor(3.1, '0:00'), throws: true },
  { name: "negative time throws: '-5:00'", fn: () => paceFor(3.1, '-5:00'), throws: true },
  { name: "H:MM:SS with minutes >= 60 throws: '1:75:00'", fn: () => paceFor(3.1, '1:75:00'), throws: true },
]

let failures = 0
for (const c of checks) {
  let outcome
  try {
    const got = c.fn()
    if (c.throws) {
      outcome = `FAIL  (expected a thrown error, got ${JSON.stringify(got)})`
    } else if (got !== c.expect) {
      outcome = `FAIL  (expected ${JSON.stringify(c.expect)}, got ${JSON.stringify(got)})`
    } else if (!OK.test(got)) {
      outcome = `FAIL  (result ${JSON.stringify(got)} is not a well-formed pace string)`
    } else {
      outcome = 'PASS'
    }
  } catch (err) {
    outcome = c.throws ? `PASS  (threw: ${err.message})` : `FAIL  (unexpected throw: ${err.message})`
  }
  if (outcome.startsWith('FAIL')) failures++
  console.log(`${outcome.startsWith('PASS') ? 'PASS' : 'FAIL'}  ${c.name}${outcome === 'PASS' ? '' : '  — ' + outcome.replace(/^(PASS|FAIL)\s*/, '')}`)
}

console.log(`\n${checks.length - failures}/${checks.length} checks passed against ${target}`)
process.exit(failures === 0 ? 0 : 1)
