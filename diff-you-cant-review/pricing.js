// v1 — the pricing module as it stands. Its contract, whether anyone wrote
// it down or not: give it items and a coupon, get back the priced order;
// your items come back untouched, and asking twice gives the same answer.
export function priceOrder(items, coupon) {
  const lines = items.map((item) => ({ ...item, lineTotal: item.price * item.qty }))
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const discount = coupon === 'HALFOFF' ? subtotal * 0.5 : 0
  return { lines, subtotal, discount, total: subtotal - discount }
}
