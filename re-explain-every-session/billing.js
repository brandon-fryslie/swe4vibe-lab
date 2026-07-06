// Session 1. You told the AI, in chat: "all money in this app is integer
// cents — never floats, never dollars." It understood perfectly and wrote
// this. The rule it obeyed is in NONE of these lines. It lived in the chat,
// and the chat is gone.
export function newOrder() {
  return { items: [] }
}

export function addItem(order, sku, amount) {
  order.items.push({ sku, amount })
}

export function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.amount, 0)
}

// Session 2, weeks later. A fresh chat — zero memory of session 1 — was
// asked: "add a $4.99 rush fee." It read this file, saw `amount`, and made
// the plausible guess anyone would make about a field with no stated units:
export function addRushFee(order) {
  addItem(order, 'rush-fee', 4.99) // ← dollars, into a cents world. Silently.
}
