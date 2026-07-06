// v2 — the AI's refactor of pricing.js, arriving as one hunk among forty in
// a diff you were asked to approve. It's shorter. It reads cleaner. The
// total on the receipt is identical. And two promises quietly died in the
// rewrite: the discount now lands in YOUR item.price (the caller's data is
// edited in place), so pricing the same cart twice halves it twice.
export function priceOrder(items, coupon) {
  let subtotal = 0
  for (const item of items) {
    if (coupon === 'HALFOFF') item.price = item.price * 0.5
    item.lineTotal = item.price * item.qty
    subtotal += item.lineTotal
  }
  return { lines: items, subtotal, discount: 0, total: subtotal }
}
