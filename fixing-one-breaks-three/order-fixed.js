// order checkout — same behavior, cut at the seams:
// each pricing job produces a finished number and hands it forward;
// nothing downstream can reach back into how it was made.

// [LAW:decomposition] pricing is one part; a discount-policy change lands here and nowhere else
export function priceItems(items, coupon) {
  const subtotal = items.reduce((s, item) => s + item.price, 0)
  return coupon ? subtotal * 0.9 : subtotal
}

export function priceShipping(shipping, coupon) {
  return coupon ? shipping * 0.9 : shipping // ← "discount applies to shipping too" was ONE line, HERE
}

export function calcTax(taxableSubtotal) {
  return taxableSubtotal * 0.08 // tax only ever sees the finished taxable number
}

export function updateOrder(order, io) {
  const subtotal = priceItems(order.items, order.coupon)
  const shipping = priceShipping(order.shipping, order.coupon)
  const tax = calcTax(subtotal)
  const total = subtotal + tax + shipping
  io.sendEmail(order.user, `You paid $${total.toFixed(2)}`)
  io.save({ ...order, total })
  return total
}
