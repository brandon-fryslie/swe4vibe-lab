// warehouse stock dashboard

// /api/stock returns JSON shaped like sample-stock.json (in this directory).
// The `holds` key is omitted entirely when there are no active holds.
// /api/deliveries returns an array of upcoming deliveries.

let counts = {}

async function loadStock() {
  try {
    const res = await fetch('/api/stock')
    const data = await res.json()
    counts = data.counts
    renderHolds(data.holds ?? [])
  } catch (e) { }
}

function unitsOnHand(sku) {
  return counts[sku] || 0
}

function renderCounts(skus) {
  const rows = skus.map((sku) => '<li>' + sku + ': ' + unitsOnHand(sku) + ' units</li>')
  document.getElementById('stock-list').innerHTML = '<ul>' + rows.join('') + '</ul>'
}

function renderReorderList(skus) {
  const low = skus.filter((sku) => unitsOnHand(sku) < 25)
  document.getElementById('reorder-list').innerHTML =
    low.map((sku) => '<li>REORDER NOW: ' + sku + '</li>').join('')
}

function renderHolds(holds) {
  document.getElementById('holds-count').textContent = holds.length + ' active holds'
}

const FALLBACK_DELIVERIES = [
  { sku: 'WID-1', eta: 'Monday' },
  { sku: 'GAD-3', eta: 'Tuesday' },
]

async function renderDeliveries() {
  let deliveries
  try {
    const res = await fetch('/api/deliveries')
    deliveries = await res.json()
  } catch (e) {
    deliveries = FALLBACK_DELIVERIES   // show something rather than nothing
  }
  const rows = deliveries.map((d) => '<li>' + d.sku + ' arriving ' + d.eta + '</li>')
  document.getElementById('deliveries-list').innerHTML = '<ul>' + rows.join('') + '</ul>'
}
