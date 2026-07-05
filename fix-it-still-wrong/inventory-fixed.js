// store inventory + cart
// [LAW:one-source-of-truth] products and cart are the only stored state;
// every other value (totals, low-stock set, cart line prices, DOM text) is
// derived from them on demand, so no update path has to keep copies in sync.

let products = [
  { id: 1, name: 'Mug', price: 12, stock: 40 },
  { id: 2, name: 'Tee', price: 25, stock: 8 },
]
// cart rows hold only { id, qty }; name and price are read from products
let cart = []

const LOW_STOCK_THRESHOLD = 10

function findProduct(id) {
  return products.find((p) => p.id === id)
}

// --- derived values (computed, never stored) ---

function totalStock() {
  return products.reduce((sum, p) => sum + p.stock, 0)
}

function lowStockIds() {
  return products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).map((p) => p.id)
}

function cartTotal() {
  let sum = 0
  for (const row of cart) sum += findProduct(row.id).price * row.qty
  return sum
}

// --- rendering ---
// [LAW:single-enforcer] one place turns state into DOM; mutators never touch
// elements directly, so the screen cannot drift from the data.

function render() {
  stockEl.textContent = totalStock() + ' items in stock'
  lowStockEl.textContent = lowStockIds().length + ' low'
  cartCountEl.textContent = cart.length + ' in cart'
  for (const p of products) priceEls[p.id].textContent = '$' + p.price
}

// --- mutations (touch only the source of truth, then render) ---

function receiveShipment(id, qty) {
  findProduct(id).stock += qty
  render()
}

function sell(id, qty) {
  findProduct(id).stock -= qty
  render()
}

function writeOff(id, qty) {
  // damaged goods
  findProduct(id).stock -= qty
  render()
}

function addToCart(id, qty) {
  cart.push({ id, qty })
  render()
}

function updatePrice(id, newPrice) {
  findProduct(id).price = newPrice
  render()
}
