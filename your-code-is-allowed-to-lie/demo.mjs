// The lesson's claim, executed — representations RUN as assertions:
//   before — a study-group tracker freshly written: every representation
//     (function name, field unit, stored count, sync comment) is TRUE, 4/4.
//     After TWO routine correct edits that never touch a lying line: 4/4
//     FALSE, and three surfaces built trusting them show wrong output with
//     zero errors.
//   after — every fact moved up the ladder (derived, unit-in-name, name
//     matched to behavior): true by construction.
//   and plants.js (this directory) carries the disease live: a stale stored
//     count, a filter-less "getIndoorPlants", a "driest first" comment over an
//     alphabetical sort camouflaged by coincidence, and a units contradiction
//     that must be flagged to the owner, not guessed — plants-fixed.js fixes
//     what is decidable and guesses nothing.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as broken from './plants.js'
import * as fixed from './plants-fixed.js'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- V1: study-group tracker, freshly written ----------
const membersV1 = [
  { name: 'Alex', hoursLogged: 12, active: true },
  { name: 'Sam', hoursLogged: 8, active: true },
  { name: 'Jo', hoursLogged: 15, active: false },
]
// kept in sync whenever members change
const statsV1 = { memberCount: 3 }
const getActiveMembersV1 = (list) => list.filter((m) => m.active)
const studyBadgeV1 = (member) => (member.hoursLogged >= 10 ? '10+ hours' : '')

// ---------- V2: after two routine requests, both edits CORRECT ----------
// R1: "Add Dana — and show everyone on the members screen."
// R2: "Hours are too coarse — track minutes." (values converted; names untouched)
const membersV2 = [
  { name: 'Alex', hoursLogged: 720, active: true },
  { name: 'Sam', hoursLogged: 480, active: true },
  { name: 'Jo', hoursLogged: 900, active: false },
  { name: 'Dana', hoursLogged: 30, active: true }, // one 30-minute session
]
const statsV2 = { memberCount: 3 } // ← "kept in sync" — untouched by either edit
const getActiveMembersV2 = (list) => list
const studyBadgeV2 = (member) => (member.hoursLogged >= 10 ? '10+ hours' : '')

// each representation, run as a claim
const claims = [
  ['name "getActiveMembers" returns only active members', (m, s, getActive) => getActive(m).every((x) => x.active)],
  ['field "hoursLogged" means hours (30 min earns no badge)', (m, s, g, badge, thirtyMin) => badge(thirtyMin) === ''],
  ['cache "stats.memberCount" equals the real count', (m, s) => s.memberCount === m.length],
  ['comment "kept in sync whenever members change"', (m, s) => s.memberCount === m.length],
]
const runClaims = (...args) => claims.filter(([, check]) => check(...args)).length

const freshScore = runClaims(membersV1, statsV1, getActiveMembersV1, studyBadgeV1, { hoursLogged: 0.5 })
const driftScore = runClaims(membersV2, statsV2, getActiveMembersV2, studyBadgeV2, { hoursLogged: 30 })
console.log(`V1 (fresh) — running the representations as claims: ${freshScore}/4 TRUE`)
console.log(`V2 (two routine requests later) — same claims:      ${driftScore}/4 TRUE`)
assert.equal(freshScore, 4) // freshly written, everything tells the truth
assert.equal(driftScore, 0) // correct edits; every representation now lies

// the harm: three surfaces built trusting the file, zero errors anywhere
const around = getActiveMembersV2(membersV2).map((m) => m.name)
const dana = membersV2.find((m) => m.name === 'Dana')
console.log(`\n"Who's around this week": ${around.join(', ')} ← Jo stepped away months ago`)
console.log(`Welcome email to Dana: "You're one of ${statsV2.memberCount} members!" ← she is member #4`)
console.log(`Dana's badge after one 30-minute session: "${studyBadgeV2(dana)}"`)
assert.ok(around.includes('Jo'))
assert.equal(statsV2.memberCount, 3)
assert.equal(membersV2.length, 4)
assert.equal(studyBadgeV2(dana), '10+ hours') // minutes compared against a threshold that meant hours

// ---------- AFTER: every fact gets a representation something checks ----------
const members = membersV2.map(({ name, hoursLogged, active }) => ({ name, minutesLogged: hoursLogged, active }))
const memberCount = () => members.length // derived — cannot disagree with the list
const activeMembers = (list) => list.filter((m) => m.active)
const allMembers = (list) => list
const BADGE_THRESHOLD_MINUTES = 10 * 60
const studyBadge = (member) => (member.minutesLogged >= BADGE_THRESHOLD_MINUTES ? '10+ hours' : '')

assert.ok(activeMembers(members).every((m) => m.active))
assert.equal(allMembers(members).length, members.length)
assert.equal(memberCount(), 4)
assert.equal(studyBadge({ minutesLogged: 30 }), '')
assert.equal(studyBadge({ minutesLogged: 720 }), '10+ hours')
console.log(`\nAFTER — derived count says ${memberCount()}, names say what they do, the unit lives in the field name.`)

// ---------- plants.js: the live module, twelve claims, who checks them? ----------
const src = readFileSync(join(here, 'plants.js'), 'utf8')
console.log('\nplants.js — running its representations as claims:')

// the stored copy is already stale: logStats says 3, the log holds 5
assert.equal(broken.logStats.totalWaterings, 3)
assert.equal(broken.careLog.length, 5)
console.log(`  FALSE cache "logStats.totalWaterings" — says ${broken.logStats.totalWaterings}, the log holds ${broken.careLog.length}`)

// the name "getIndoorPlants" — the filter was edited away; it returns the patio plant too
const indoor = broken.getIndoorPlants(broken.plants)
assert.equal(indoor.length, broken.plants.length)
assert.ok(indoor.some((p) => p.spot === 'patio'))
console.log('  FALSE name "getIndoorPlants" — returns everything, including the patio Basil')

// the comment "driest first" over an alphabetical sort — with coincidence camouflage:
// the wrong sort accidentally puts the right plant first, so eyeballing passes
const queue = broken.wateringQueue(broken.plants)
const byDryness = [...broken.plants].sort((a, b) => b.wateredDaysAgo - a.wateredDaysAgo)
assert.equal(queue[0].name, byDryness[0].name) // the camouflage: first item looks right...
assert.notDeepEqual(queue.map((p) => p.name), byDryness.map((p) => p.name)) // ...the order is a lie
console.log(`  FALSE comment "driest first" — alphabetical; first item (${queue[0].name}) is coincidentally the driest`)

// the units contradiction: wateredLabel reads the field as HOURS (/24),
// needsWater reads it as DAYS (>= 3). Undecidable inside the file — the fix
// must flag it to the owner, not guess. Assert the contradiction is real:
const monstera = broken.plants[0] // wateredDaysAgo: 30
assert.equal(broken.wateredLabel(monstera), '1 days ago') // 30/24 → the "hours" reading
assert.equal(broken.needsWater(monstera), true) // 30 >= 3 → the "days" reading
console.log('  FLAG  field "wateredDaysAgo" — one caller reads hours, one reads days; owner must decide')

// ---------- plants-fixed.js: decidable lies fixed, nothing guessed ----------
// the count is derived now — it physically cannot disagree with the log
assert.equal(fixed.logStats.totalWaterings, fixed.wateringLog.length)
// names match behavior: allPlants says what getIndoorPlants did; plantsByName says what the sort does
assert.equal(fixed.allPlants(fixed.plants).length, fixed.plants.length)
assert.deepEqual(fixed.plantsByName(fixed.plants).map((p) => p.name), [...fixed.plants].map((p) => p.name).sort())
// the units contradiction was NOT guessed: both readings preserved, flagged for the owner
assert.equal(fixed.wateredLabel(fixed.plants[0]), broken.wateredLabel(broken.plants[0]))
assert.equal(fixed.needsWater(fixed.plants[0]), broken.needsWater(broken.plants[0]))
// true negatives survived: the why-comment (trimmed to its why) and the derived helper
const fixedSrc = readFileSync(join(here, 'plants-fixed.js'), 'utf8')
assert.match(fixedSrc, /succulents rot on a full pour/)
assert.equal(fixed.pourFor({ succulent: true }, 200), 100)
assert.equal(fixed.plantCount(fixed.plants), fixed.plants.length)
console.log('\nplants-fixed.js: count derived, names true, why-comment kept, units contradiction flagged not guessed.')

console.log('claims hold: everything that stands for something else is checked by a machine — or lying on a timer.')
