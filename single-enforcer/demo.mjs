// The lesson's claim, executed:
//   before — six admin actions, each pasted with its own "is this caller a
//     non-suspended admin" check. A later security rule (block suspended
//     admins) got patched into five of the six the day it was requested;
//     refundOrder — shipped a release earlier, not mentioned in that request —
//     kept the old check. A suspended admin is blocked everywhere except the
//     one handler nobody thought to revisit, and still refunds orders.
//   after — one assertAdmin() function, six callers routing through it. The
//     suspended admin is blocked everywhere, including refundOrder, with no
//     edit to refundOrder's own rule — and the rule is now written once, not
//     paraphrased six times.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as before from './admin-api.js'
import * as after from './admin-api-fixed.js'

const freshUsers = () => ({
  alice: { role: 'admin', suspended: false },
  bob: { role: 'admin', suspended: true }, // suspended pending an internal review
  carol: { role: 'support', suspended: false },
})

console.log('=== BEFORE: an admin check pasted fresh into six handlers ===')
{
  const users = freshUsers()
  // alice: a normal, active admin — every action works.
  assert.equal(before.deleteUser(users, 'alice', 'carol'), 'deleted carol')
  assert.equal(before.banUser(freshUsers(), 'alice', 'bob'), 'banned bob')
  assert.equal(before.resetPassword(freshUsers(), 'alice', 'bob'), 'password reset for bob')
  assert.equal(before.exportAuditLog(freshUsers(), 'alice'), 'audit-log.csv')
  assert.equal(before.changePlanPrice(freshUsers(), 'alice', 'pro', 2900), 'pro is now $29.00')
  assert.equal(before.refundOrder(freshUsers(), 'alice', 'ord_1', 4200), 'refunded ord_1: $42.00')
  console.log('alice (active admin): all six actions succeed')

  // bob: suspended pending review — five handlers correctly refuse him.
  for (const [name, call] of [
    ['deleteUser', () => before.deleteUser(freshUsers(), 'bob', 'carol')],
    ['banUser', () => before.banUser(freshUsers(), 'bob', 'carol')],
    ['resetPassword', () => before.resetPassword(freshUsers(), 'bob', 'carol')],
    ['exportAuditLog', () => before.exportAuditLog(freshUsers(), 'bob')],
    ['changePlanPrice', () => before.changePlanPrice(freshUsers(), 'bob', 'pro', 2900)],
  ]) {
    assert.throws(call, /forbidden/, `${name} should have refused a suspended admin`)
  }
  console.log('bob (suspended): correctly refused by deleteUser, banUser, resetPassword, exportAuditLog, changePlanPrice')

  // refundOrder never got the memo — same suspended admin, live refund.
  const refund = before.refundOrder(freshUsers(), 'bob', 'ord_9', 8800)
  assert.equal(refund, 'refunded ord_9: $88.00')
  console.log(`bob (suspended): refundOrder still lets him through -> "${refund}"`)

  // carol was never an admin at all — the role half of the check still holds
  // everywhere, refundOrder included. This isn't "no check"; it's a check that
  // drifted in five places and stayed frozen in the sixth.
  assert.throws(() => before.refundOrder(freshUsers(), 'carol', 'ord_1', 100), /forbidden/)
}

console.log('\n=== AFTER: one assertAdmin(), six callers ===')
{
  const users = freshUsers()
  assert.equal(after.deleteUser(users, 'alice', 'carol'), 'deleted carol')
  assert.equal(after.banUser(freshUsers(), 'alice', 'bob'), 'banned bob')
  assert.equal(after.refundOrder(freshUsers(), 'alice', 'ord_1', 4200), 'refunded ord_1: $42.00')
  console.log('alice (active admin): unaffected — all actions still succeed')

  for (const [name, call] of [
    ['deleteUser', () => after.deleteUser(freshUsers(), 'bob', 'carol')],
    ['banUser', () => after.banUser(freshUsers(), 'bob', 'carol')],
    ['resetPassword', () => after.resetPassword(freshUsers(), 'bob', 'carol')],
    ['exportAuditLog', () => after.exportAuditLog(freshUsers(), 'bob')],
    ['changePlanPrice', () => after.changePlanPrice(freshUsers(), 'bob', 'pro', 2900)],
    ['refundOrder', () => after.refundOrder(freshUsers(), 'bob', 'ord_9', 8800)],
  ]) {
    assert.throws(call, /forbidden/, `${name} should refuse a suspended admin`)
  }
  console.log('bob (suspended): refused by all six actions, refundOrder included — no edit to refundOrder itself')

  assert.throws(() => after.refundOrder(freshUsers(), 'carol', 'ord_1', 100), /forbidden/)
}

console.log('\n=== the count: how many places encode the rule ===')
const beforeSrc = readFileSync(new URL('./admin-api.js', import.meta.url), 'utf8')
const afterSrc = readFileSync(new URL('./admin-api-fixed.js', import.meta.url), 'utf8')
const occurrences = (src, needle) => src.split(needle).length - 1
const beforeChecks = occurrences(beforeSrc, "user.role !== 'admin'")
const afterChecks = occurrences(afterSrc, "user.role !== 'admin'")
assert.equal(beforeChecks, 6) // pasted fresh into every handler; drifted in one
assert.equal(afterChecks, 1) // one boundary; every handler routes through it
console.log(`the admin rule is written ${beforeChecks} times before this fix, ${afterChecks} time after`)

console.log('\nclaims hold: the duplicated check drifted in exactly the one place nobody revisited; the single enforcer closes it with zero edits to that handler\'s own body.')
