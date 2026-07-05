// The lesson's claims, executed:
//   before — a rule's real meaning is its own test PLUS the invisible negation
//     of every test above it; "add a platinum badge for 50+ orders", appended
//     at the bottom like every rule before it, is DEAD ON ARRIVAL (60 orders → gold).
//   after — rules are data carrying the value that matters; the same careless
//     edit (row appended last) works, and every pre-platinum user is unchanged.
//   specimen — priority.js has a planted shadowed rule (`pro && ageDays > 5`)
//     that can never win; as branches that's invisible, as data it's computable.
//     priority-fixed.js drops it and is behavior-identical across the full grid.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// ---------- the badge maze (the lesson's example) ----------
function badgeForBefore(user) {
  if (user.orders > 10) {
    if (user.referred) return 'gold-friend'
    return 'gold'
  }
  if (user.referred) return 'friend'
  if (user.orders > 50) return 'platinum'   // ← the new rule, added at the bottom
  return 'new'
}

console.log('BEFORE — "add a platinum badge for 50+ orders", appended like every rule before it:')
console.log('  user with 60 orders →', JSON.stringify(badgeForBefore({ orders: 60, referred: false })))
assert.equal(badgeForBefore({ orders: 60, referred: false }), 'gold') // platinum never fires
// unreachable for EVERY user: anyone with >50 orders is captured by `orders > 10` above
for (let orders = 0; orders <= 100; orders++) {
  for (const referred of [false, true]) {
    assert.notEqual(badgeForBefore({ orders, referred }), 'platinum')
  }
}
console.log('  platinum reachable for anyone at all? false (swept orders 0–100, referred both ways)')

// ---------- after: rules as data, priority computed from values ----------
const BADGE_RULES = [
  { minOrders: 10, badge: 'gold' },
  { minOrders: 50, badge: 'platinum' },   // ← same edit, same careless spot: the bottom
]
function badgeForAfter(user) {
  const earned = BADGE_RULES.filter((r) => user.orders > r.minOrders)
  const best = earned.sort((a, b) => b.minOrders - a.minOrders)[0]
  if (!best) return user.referred ? 'friend' : 'new'
  return user.referred && best.badge === 'gold' ? 'gold-friend' : best.badge
}
console.log('AFTER — same rule, same careless spot (bottom of the list):')
console.log('  user with 60 orders →', JSON.stringify(badgeForAfter({ orders: 60, referred: false })))
assert.equal(badgeForAfter({ orders: 60, referred: false }), 'platinum')
// everyone who existed before behaves the same
for (let orders = 0; orders <= 50; orders++) {
  for (const referred of [false, true]) {
    assert.equal(badgeForAfter({ orders, referred }), badgeForBefore({ orders, referred }),
      `pre-platinum user changed: orders=${orders} referred=${referred}`)
  }
}
console.log('  all pre-platinum users unchanged — position stopped mattering; priority lives in the values.')

// ---------- the specimen: priority.js and its planted dead rule ----------
const load = (file, names) => {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
  return new Function(code + `\n;return { ${names.join(', ')} };`)()
}
const beforeTriage = load('./priority.js', ['supportPriority']).supportPriority
const fixed = load('./priority-fixed.js', ['supportPriority', 'RULES', 'ruleMatches'])

// the full input grid: every plan × age 0..10 × subject with/without 'outage'
const grid = []
for (const plan of ['free', 'pro', 'enterprise']) {
  for (let ageDays = 0; ageDays <= 10; ageDays++) {
    for (const subject of ['Billing question', 'Total outage since 9am']) {
      grid.push({ plan, ageDays, subject })
    }
  }
}

// claim: the fixed version DROPPED a branch and behavior is identical everywhere
for (const t of grid) {
  assert.equal(fixed.supportPriority(t), beforeTriage(t),
    `diverged: ${JSON.stringify(t)}`)
}
console.log(`\nspecimen: priority-fixed.js matches priority.js on all ${grid.length} grid inputs —`)
console.log('the `pro && ageDays > 5` branch it deleted was dead weight, not behavior.')

// claim: as DATA, deadness is computable. Re-plant the original rule as a row
// in the position matching the original branch order, and detect it.
const plantedRules = [...fixed.RULES.slice(0, 6),
  { plan: 'pro', ageOver: 5, subjectHas: null, result: 'p1' },  // the original planted rule
  fixed.RULES[6]]
const reachable = plantedRules.map((rule, i) =>
  grid.some((t) => plantedRules.findIndex((r) => fixed.ruleMatches(r, t)) === i))
assert.equal(reachable[6], false)                       // the planted rule: provably dead
assert.equal(reachable.filter(Boolean).length, 7)       // every real rule: provably alive
console.log('re-planting the dead rule as a data row and sweeping the grid: rule 7/8 never wins —')
console.log('a position-bug that was invisible in the branch tree is one .some() over the rule list.')

console.log('\nclaims hold: the appended rule dies in the maze exactly as the lesson says; as data it cannot be shadowed silently.')
