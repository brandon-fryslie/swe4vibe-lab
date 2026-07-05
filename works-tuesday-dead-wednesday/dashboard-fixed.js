// orders dashboard — filter dropdown + live refresh

// [LAW:no-ambient-temporal-coupling] Each user-visible target gets one write
// owner. Every request takes a monotonically increasing id at start; only the
// request holding the newest id may write. Response arrival order stops
// mattering — "newest intent wins" is decided at request start, the one
// ordering the user actually perceives.
const newestWriter = () => {
  let newest = 0
  return async (fetchValue, write) => {
    const id = ++newest
    const value = await fetchValue()
    if (id !== newest) return // a newer request owns this target now
    write(value)
  }
}

// [LAW:one-source-of-truth] The table is ONE finish line with two triggers
// (filter change, interval). They must share one owner and one fetch path —
// separate counters would just re-create the cross-race.
const writeTable = newestWriter()
const writeExport = newestWriter()

let rows = []

const loadOrders = () => writeTable(
  async () => {
    const res = await fetch('/api/orders?status=' + filterSelect.value)
    return res.json()
  },
  (data) => {
    rows = data
    drawTable(rows)
  },
)

filterSelect.addEventListener('change', loadOrders)

// keep the table fresh
setInterval(loadOrders, 5000)

exportBtn.addEventListener('click', () => writeExport(
  async () => {
    const res = await fetch('/api/orders/export', { method: 'POST' })
    return res.json()
  },
  ({ url }) => {
    exportLink.href = url
    exportLink.textContent = 'Download export'
  },
))
