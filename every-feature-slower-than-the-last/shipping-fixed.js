// shipping cost calculator

// [LAW:one-type-per-behavior] the three methods differ only by these values
const SHIPPING_METHODS = {
  standard: { baseMultiplier: 1, priceElementId: 'standard-price' },
  express: { baseMultiplier: 1.8, priceElementId: 'express-price' },
  overnight: { baseMultiplier: 3, priceElementId: 'overnight-price' },
}

// [LAW:one-source-of-truth] every shipping price in the app is computed here
function shippingCost(method, weight, distance) {
  const base = (5 + weight * 0.5) * SHIPPING_METHODS[method].baseMultiplier
  const distanceSurcharge = Math.max(0, distance - 100) * 0.02
  const heavySurcharge = weight > 20 ? 10 : 0
  const FUEL_SURCHARGE_RATE = 0.06
  return (base + distanceSurcharge + heavySurcharge) * (1 + FUEL_SURCHARGE_RATE)
}

function formatPrice(cost) {
  return '$' + cost.toFixed(2)
}

// [LAW:effects-at-boundaries] DOM reads/writes live here; the pricing above stays pure
function calcShipping(method) {
  const weight = Number(document.getElementById('pkg-weight').value)
  const distance = Number(document.getElementById('pkg-distance').value)
  const cost = shippingCost(method, weight, distance)
  document.getElementById(SHIPPING_METHODS[method].priceElementId).textContent = formatPrice(cost)
  return cost
}

function calcStandardShipping() {
  return calcShipping('standard')
}

function calcExpressShipping() {
  return calcShipping('express')
}

function calcOvernightShipping() {
  return calcShipping('overnight')
}

function checkoutShippingLine(weight, distance, method) {
  return formatPrice(shippingCost(method, weight, distance))
}
