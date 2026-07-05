// order checkout — prices the cart, sends the confirmation, saves

export function updateOrder(order, io) {
  let total = 0
  for (const item of order.items) total += item.price
  if (order.coupon) total = total * 0.9 // 10% off
  const tax = total * 0.08
  total = total + tax
  total = total + order.shipping // shipping goes on last, untaxed
  io.sendEmail(order.user, `You paid $${total.toFixed(2)}`)
  io.save({ ...order, total })
  return total
}
