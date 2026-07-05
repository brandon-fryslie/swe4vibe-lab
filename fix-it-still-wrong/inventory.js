// store inventory + cart

let products = [
  { id: 1, name: 'Mug', price: 12, stock: 40 },
  { id: 2, name: 'Tee', price: 25, stock: 8 },
]
let totalStock = 48
let lowStockIds = [2]
let cart = []

function receiveShipment(id, qty) {
  const p = products.find((p) => p.id === id)
  p.stock += qty
  totalStock += qty
  if (p.stock >= 10) lowStockIds = lowStockIds.filter((x) => x !== id)
  stockEl.textContent = totalStock + ' items in stock'
  lowStockEl.textContent = lowStockIds.length + ' low'
}

function sell(id, qty) {
  const p = products.find((p) => p.id === id)
  p.stock -= qty
  totalStock -= qty
  if (p.stock < 10 && !lowStockIds.includes(id)) lowStockIds.push(id)
  stockEl.textContent = totalStock + ' items in stock'
  lowStockEl.textContent = lowStockIds.length + ' low'
}

function writeOff(id, qty) {
  // damaged goods
  const p = products.find((p) => p.id === id)
  p.stock -= qty
}

function addToCart(id, qty) {
  const p = products.find((p) => p.id === id)
  cart.push({ id, name: p.name, price: p.price, qty })
  cartCountEl.textContent = cart.length + ' in cart'
}

function updatePrice(id, newPrice) {
  const p = products.find((p) => p.id === id)
  p.price = newPrice
  priceEls[id].textContent = '$' + newPrice
}

function cartTotal() {
  let sum = 0
  for (const row of cart) sum += row.price * row.qty
  return sum
}
