// admin-api-fixed.js — one checkpoint, six callers. The rule lives here, once;
// every handler routes through it instead of carrying its own copy.

function assertAdmin(user) {
  if (!user || user.role !== 'admin' || user.suspended) throw new Error('forbidden')
}

export function deleteUser(users, caller, targetId) {
  assertAdmin(users[caller])
  delete users[targetId]
  return `deleted ${targetId}`
}

export function banUser(users, caller, targetId) {
  assertAdmin(users[caller])
  users[targetId].banned = true
  return `banned ${targetId}`
}

export function resetPassword(users, caller, targetId) {
  assertAdmin(users[caller])
  return `password reset for ${targetId}`
}

export function exportAuditLog(users, caller) {
  assertAdmin(users[caller])
  return 'audit-log.csv'
}

export function changePlanPrice(users, caller, plan, cents) {
  assertAdmin(users[caller])
  return `${plan} is now $${(cents / 100).toFixed(2)}`
}

export function refundOrder(users, caller, orderId, cents) {
  assertAdmin(users[caller])
  return `refunded ${orderId}: $${(cents / 100).toFixed(2)}`
}
