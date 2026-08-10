// admin-api.js — an internal support tool. Every action starts with the same
// admin check, pasted in fresh each time a new action shipped.

export function deleteUser(users, caller, targetId) {
  const user = users[caller]
  if (!user || user.role !== 'admin' || user.suspended) throw new Error('forbidden: deleteUser')
  delete users[targetId]
  return `deleted ${targetId}`
}

export function banUser(users, caller, targetId) {
  const user = users[caller]
  if (!user || user.role !== 'admin' || user.suspended) throw new Error('forbidden: banUser')
  users[targetId].banned = true
  return `banned ${targetId}`
}

export function resetPassword(users, caller, targetId) {
  const user = users[caller]
  if (!user || user.role !== 'admin' || user.suspended) throw new Error('forbidden: resetPassword')
  return `password reset for ${targetId}`
}

export function exportAuditLog(users, caller) {
  const user = users[caller]
  if (!user || user.role !== 'admin' || user.suspended) throw new Error('forbidden: exportAuditLog')
  return 'audit-log.csv'
}

export function changePlanPrice(users, caller, plan, cents) {
  const user = users[caller]
  if (!user || user.role !== 'admin' || user.suspended) throw new Error('forbidden: changePlanPrice')
  return `${plan} is now $${(cents / 100).toFixed(2)}`
}

// refundOrder shipped a release before "suspended" existed. Nobody thought to
// revisit it when the suspension rule landed on the other five handlers.
export function refundOrder(users, caller, orderId, cents) {
  const user = users[caller]
  if (!user || user.role !== 'admin') throw new Error('forbidden: refundOrder')
  return `refunded ${orderId}: $${(cents / 100).toFixed(2)}`
}
