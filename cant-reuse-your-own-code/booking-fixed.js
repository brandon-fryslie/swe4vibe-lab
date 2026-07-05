// event space booking

// --- pricing (pure: inputs in, result out; no DOM, no globals) ---

const HOURLY_RATE = 150
const SUNDAY_MULTIPLIER = 1.25
const INCLUDED_GUESTS = 50
const EXTRA_GUEST_FEE = 4
const TAX_RATE = 0.0825

// The one pricing rule. Invoices, quotes, and bookings all derive from this.
function computeSubtotal({ hours, guests, isSunday }) {
  const dayMultiplier = isSunday ? SUNDAY_MULTIPLIER : 1
  const extraGuests = Math.max(0, guests - INCLUDED_GUESTS)
  return hours * HOURLY_RATE * dayMultiplier + extraGuests * EXTRA_GUEST_FEE
}

function applyTax(amount) {
  return amount * (1 + TAX_RATE)
}

function computeInvoiceTotal(details) {
  return applyTax(computeSubtotal(details))
}

function formatMoney(amount) {
  return '$' + amount.toFixed(2)
}

// --- DOM boundary (reads inputs, writes outputs; delegates all math above) ---

let bookings = []

function readBookingInputs(day) {
  return {
    hours: Number(document.getElementById(day + '-hours').value),
    guests: Number(document.getElementById(day + '-guests').value),
    isSunday: day === 'sun',
  }
}

function renderInvoice(day) {
  const details = readBookingInputs(day)
  const total = computeInvoiceTotal(details)
  document.getElementById(day + '-total').textContent = formatMoney(total)
  return { details, total }
}

function calcSaturdayInvoice() {
  return renderInvoice('sat').total
}

function calcSundayInvoice() {
  return renderInvoice('sun').total
}

// Quotes are pre-tax, matching the original widget's behavior.
function calcQuote(hours, guests, isSunday) {
  return formatMoney(computeSubtotal({ hours, guests, isSunday }))
}

function bookEvent(day) {
  const { details, total } = renderInvoice(day)
  const booking = { day, hours: details.hours, guests: details.guests, total }
  bookings.push(booking)
  document.getElementById('booking-count').textContent = bookings.length + ' bookings'
  fetch('/api/bookings', { method: 'POST', body: JSON.stringify(booking) })
}
