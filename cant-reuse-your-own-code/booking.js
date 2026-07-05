// event space booking

let bookings = []

function calcSaturdayInvoice() {
  const hours = Number(document.getElementById('sat-hours').value)
  const guests = Number(document.getElementById('sat-guests').value)
  let total = hours * 150
  if (guests > 50) total += (guests - 50) * 4
  total = total * 1.0825
  document.getElementById('sat-total').textContent = '$' + total.toFixed(2)
  return total
}

function calcSundayInvoice() {
  const hours = Number(document.getElementById('sun-hours').value)
  const guests = Number(document.getElementById('sun-guests').value)
  let total = hours * 150 * 1.25
  if (guests > 50) total += (guests - 50) * 4
  total = total * 1.0825
  document.getElementById('sun-total').textContent = '$' + total.toFixed(2)
  return total
}

function calcQuote(hours, guests, isSunday) {
  // copied from the invoice code for the quote widget -- keep in sync!
  let total = hours * 150
  if (isSunday) total = total * 1.25
  if (guests > 50) total += (guests - 50) * 4
  return '$' + total.toFixed(2)
}

function bookEvent(day) {
  const hours = Number(document.getElementById(day + '-hours').value)
  const guests = Number(document.getElementById(day + '-guests').value)
  const total = day === 'sun' ? calcSundayInvoice() : calcSaturdayInvoice()
  bookings.push({ day, hours, guests, total })
  document.getElementById('booking-count').textContent = bookings.length + ' bookings'
  fetch('/api/bookings', { method: 'POST', body: JSON.stringify({ day, hours, guests, total }) })
}
