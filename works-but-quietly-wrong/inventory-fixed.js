// warehouse stock dashboard

// /api/stock returns JSON shaped like sample-stock.json (in this directory).
// The `holds` key is omitted entirely when there are no active holds.
// /api/deliveries returns an array of upcoming deliveries.

// [LAW:types-are-the-program] null means "not loaded"; {} used to mean both
// "not loaded" and "loaded, empty", which is what let a failed fetch render as 0s.
let counts = null

// [LAW:single-enforcer] every failed load renders through this one explicit state.
function showLoadError(elementId, what) {
  document.getElementById(elementId).innerHTML =
    '<p class="load-error">Couldn’t load ' + what + '. Showing nothing rather than a wrong number.</p>'
}

// [LAW:no-silent-failure] fetch + shape validation at the trust boundary;
// anything unexpected throws instead of flowing downstream as fake data.
async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(url + ' failed: HTTP ' + res.status)
  }
  return res.json()
}

async function loadStock() {
  let data
  try {
    data = await fetchJson('/api/stock')
    if (data === null || typeof data !== 'object' || typeof data.counts !== 'object' || data.counts === null) {
      throw new Error('/api/stock returned unexpected shape: missing counts')
    }
  } catch (e) {
    counts = null // [LAW:one-source-of-truth] a failed load must not leave stale counts looking current
    showLoadError('stock-list', 'stock counts')
    showLoadError('reorder-list', 'stock counts')
    showLoadError('holds-count', 'holds')
    throw e
  }
  counts = data.counts
  // [LAW:no-defensive-null-guards] keep: the API omits `holds` when there are
  // zero active holds, so [] is the true value of a genuinely absent key.
  renderHolds(data.holds ?? [])
}

function unitsOnHand(sku) {
  // [LAW:no-silent-failure] "not loaded" and "unknown sku" are not 0 units.
  // The old `counts[sku] || 0` turned a failed load into hard zeros and
  // false REORDER NOW alerts for every sku.
  if (counts === null) {
    throw new Error('stock counts not loaded; cannot report units for ' + sku)
  }
  const n = counts[sku]
  if (typeof n !== 'number') {
    throw new Error('sku ' + sku + ' missing from /api/stock counts')
  }
  return n
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

async function renderDeliveries() {
  let deliveries
  try {
    deliveries = await fetchJson('/api/deliveries')
    if (!Array.isArray(deliveries)) {
      throw new Error('/api/deliveries returned unexpected shape: expected an array')
    }
  } catch (e) {
    // [LAW:no-silent-failure] no fabricated schedule; an empty error state is
    // strictly cheaper than a driver waiting on a made-up ETA.
    showLoadError('deliveries-list', 'deliveries')
    throw e
  }
  const rows = deliveries.map((d) => '<li>' + d.sku + ' arriving ' + d.eta + '</li>')
  document.getElementById('deliveries-list').innerHTML = '<ul>' + rows.join('') + '</ul>'
}
