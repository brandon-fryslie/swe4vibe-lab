// shipping cost calculator

function calcStandardShipping() {
  const weight = Number(document.getElementById('pkg-weight').value)
  const distance = Number(document.getElementById('pkg-distance').value)
  let cost = 5 + weight * 0.5
  if (distance > 100) cost += (distance - 100) * 0.02
  if (weight > 20) cost += 10
  document.getElementById('standard-price').textContent = '$' + cost.toFixed(2)
  return cost
}

function calcExpressShipping() {
  const weight = Number(document.getElementById('pkg-weight').value)
  const distance = Number(document.getElementById('pkg-distance').value)
  let cost = (5 + weight * 0.5) * 1.8
  if (distance > 100) cost += (distance - 100) * 0.02
  if (weight > 20) cost += 10
  document.getElementById('express-price').textContent = '$' + cost.toFixed(2)
  return cost
}

function calcOvernightShipping() {
  const weight = Number(document.getElementById('pkg-weight').value)
  const distance = Number(document.getElementById('pkg-distance').value)
  let cost = (5 + weight * 0.5) * 3
  if (distance > 100) cost += (distance - 100) * 0.02
  if (weight > 20) cost += 10
  document.getElementById('overnight-price').textContent = '$' + cost.toFixed(2)
  return cost
}

function checkoutShippingLine(weight, distance, method) {
  // copied from the calculator functions so checkout can show shipping -- keep in sync!
  let cost = 5 + weight * 0.5
  if (method === 'express') cost = (5 + weight * 0.5) * 1.8
  if (method === 'overnight') cost = (5 + weight * 0.5) * 3
  if (distance > 100) cost += (distance - 100) * 0.02
  if (weight > 20) cost += 10
  return '$' + cost.toFixed(2)
}
