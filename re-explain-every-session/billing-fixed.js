// The same module with the cents rule moved out of the chat and into the
// repo — the only memory the next session gets. Three encodings, cheapest
// first: the name says the unit, the check enforces it, and every write
// goes through the one gate that carries both.
export function cents(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError(
      `money is integer cents in this app — got ${n}. ` +
        `(Dollars? Multiply by 100 at the edge where the number enters.)`
    )
  }
  return n
}

export function newOrder() {
  return { items: [] }
}

export function addItem(order, sku, amountCents) {
  order.items.push({ sku, amount: cents(amountCents) })
}

export function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + cents(item.amount), 0)
}
