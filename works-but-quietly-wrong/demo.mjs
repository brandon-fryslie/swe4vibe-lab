// The lesson's claims, executed:
//   before — an empty catch + `|| 1` on exchange rates convert two different
//     failures (API outage, provider format change) into the SAME wrong but
//     plausible revenue number, with zero errors anywhere.
//   after — failures throw at the boundary and render a visible error naming
//     the cause; there is no path where a missing rate becomes a number.
//   module — the warehouse dashboard (inventory.js) runs four realities:
//     a stock outage renders "0 units" + REORDER NOW for every sku; a
//     deliveries outage renders a FABRICATED schedule; inventory-fixed.js
//     makes both loud — and both versions keep the one TRUE default
//     (`holds ?? []`: the API omits the key when there are no holds —
//     see sample-stock.json).
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// ---------- the revenue dashboard (the lesson's example) ----------
const orders = [
  { amount: 12400, currency: 'USD' },
  { amount: 9300,  currency: 'EUR' },
  { amount: 6200,  currency: 'GBP' },
  { amount: 8150,  currency: 'USD' },
  { amount: 11700, currency: 'EUR' },
]
const REAL_RATES = { USD: 1, EUR: 1.09, GBP: 1.27 }
const scenarios = {
  healthy:      async () => ({ ok: true,  status: 200, json: async () => REAL_RATES }),
  outage:       async () => ({ ok: false, status: 503, json: async () => { throw new Error('not json') } }),
  formatChange: async () => ({ ok: true,  status: 200, json: async () => ({ base: 'USD', rates: REAL_RATES }) }),
}
const money = (n) => '$' + Math.round(n).toLocaleString('en-US')
const trueTotal = money(orders.reduce((s, o) => s + o.amount * REAL_RATES[o.currency], 0))   // $51,314
const forgedTotal = money(orders.reduce((s, o) => s + o.amount, 0))                          // $47,750

function makeBefore(fetch) {
  let rates = {}
  async function loadRates() {
    try {
      const res = await fetch('/api/rates')
      rates = await res.json()
    } catch (e) { }                                  // ← added to stop the crash spam
  }
  const toUSD = (amount, currency) => amount * (rates[currency] || 1)  // ← 1 "just in case"
  return async () => {
    await loadRates()
    return money(orders.reduce((s, o) => s + toUSD(o.amount, o.currency), 0))
  }
}
function makeAfter(fetch) {
  async function loadRates() {
    const res = await fetch('/api/rates')
    if (!res.ok) throw new Error('rates API returned ' + res.status)
    return res.json()
  }
  function toUSD(rates, amount, currency) {
    const rate = rates[currency]
    if (rate === undefined) throw new Error('no exchange rate for ' + currency)
    return amount * rate
  }
  return async () => {
    try {
      const rates = await loadRates()
      return money(orders.reduce((s, o) => s + toUSD(rates, o.amount, o.currency), 0))
    } catch (e) {
      return 'Revenue unavailable — ' + e.message    // ← the real arm
    }
  }
}

const shown = {}
for (const [name, fetch] of Object.entries(scenarios)) {
  shown[name] = { before: await makeBefore(fetch)(), after: await makeAfter(fetch)() }
  console.log(`${name.padEnd(13)} | BEFORE: ${shown[name].before.padEnd(12)} | AFTER: ${shown[name].after}`)
}
assert.equal(shown.healthy.before, trueTotal)
assert.equal(shown.healthy.after, trueTotal)
// two unrelated failures, one identical forged number, no error either time
assert.equal(shown.outage.before, forgedTotal)
assert.equal(shown.formatChange.before, forgedTotal)
// the after names each failure instead of printing a number
assert.equal(shown.outage.after, 'Revenue unavailable — rates API returned 503')
assert.equal(shown.formatChange.after, 'Revenue unavailable — no exchange rate for USD')
console.log(`→ ${forgedTotal} doesn't look broken. It looks like a slow month.`)

// ---------- the module: the warehouse dashboard, four realities ----------
const fixture = JSON.parse(readFileSync(new URL('./sample-stock.json', import.meta.url), 'utf8'))
const SKUS = Object.keys(fixture.counts)                       // WID-1, WID-2, GAD-3
const DELIVERIES = [{ sku: 'WID-2', eta: 'Thursday' }]

const ok = (body) => ({ ok: true, status: 200, json: async () => body })
const down = () => { throw new Error('network down') }
const realities = {
  healthy:        { '/api/stock': () => ok(fixture),                    '/api/deliveries': () => ok(DELIVERIES) },
  stockDown:      { '/api/stock': down,                                 '/api/deliveries': () => ok(DELIVERIES) },
  deliveriesDown: { '/api/stock': () => ok(fixture),                    '/api/deliveries': down },
  noHolds:        { '/api/stock': () => ok({ counts: fixture.counts }), '/api/deliveries': () => ok(DELIVERIES) },
}

function loadDashboard(file, endpoints, els) {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
  const doc = { getElementById: (id) => els[id] }
  const fetch = async (url) => endpoints[url]()
  return new Function('fetch', 'document',
    code + '\n;return { loadStock, renderCounts, renderReorderList, renderDeliveries };')(fetch, doc)
}
const freshEls = () => Object.fromEntries(
  ['stock-list', 'reorder-list', 'holds-count', 'deliveries-list']
    .map((id) => [id, { innerHTML: '', textContent: '' }]))

async function run(file, endpoints) {
  const els = freshEls()
  const app = loadDashboard(file, endpoints, els)
  const loud = []
  try { await app.loadStock(); app.renderCounts(SKUS); app.renderReorderList(SKUS) }
  catch (e) { loud.push(e.message) }
  try { await app.renderDeliveries() } catch (e) { loud.push(e.message) }
  return { els, loud }
}

console.log('')
const r = {}
for (const [name, endpoints] of Object.entries(realities)) {
  r[name] = {
    before: await run('./inventory.js', endpoints),
    fixed: await run('./inventory-fixed.js', endpoints),
  }
}

// healthy: both correct — WID-2 is genuinely low (18 < 25), so one true reorder line
assert.ok(r.healthy.before.els['stock-list'].innerHTML.includes('WID-1: 340 units'))
assert.equal(r.healthy.before.els['reorder-list'].innerHTML, '<li>REORDER NOW: WID-2</li>')
assert.equal(r.healthy.fixed.els['reorder-list'].innerHTML, '<li>REORDER NOW: WID-2</li>')
console.log('healthy        | both render 340/18/96 units and the one TRUE reorder (WID-2 is low).')

// stock outage: before renders hard zeros and a reorder alert for EVERY sku, silently
assert.equal(r.stockDown.before.loud.length, 0)
for (const sku of SKUS) assert.ok(r.stockDown.before.els['stock-list'].innerHTML.includes(sku + ': 0 units'))
for (const sku of SKUS) assert.ok(r.stockDown.before.els['reorder-list'].innerHTML.includes('REORDER NOW: ' + sku))
console.log('stockDown      | BEFORE: "0 units" ×3 and REORDER NOW for the whole building — zero errors.')
// fixed: loud + explicit couldn't-load state, and no fake numbers anywhere
assert.ok(r.stockDown.fixed.loud.length >= 1)
assert.ok(r.stockDown.fixed.els['stock-list'].innerHTML.includes('Couldn’t load'))
assert.ok(!r.stockDown.fixed.els['stock-list'].innerHTML.includes('0 units'))
console.log('               | FIXED:  loud error + explicit couldn\'t-load state; no fabricated zeros.')

// deliveries outage: before renders a schedule that does not exist
assert.equal(r.deliveriesDown.before.loud.length, 0)
assert.ok(r.deliveriesDown.before.els['deliveries-list'].innerHTML.includes('WID-1 arriving Monday'))
console.log('deliveriesDown | BEFORE: a driver-ready schedule ("WID-1 arriving Monday") that is FICTION.')
assert.ok(r.deliveriesDown.fixed.loud.length >= 1)
assert.ok(r.deliveriesDown.fixed.els['deliveries-list'].innerHTML.includes('Couldn’t load'))
console.log('               | FIXED:  loud error + couldn\'t-load state; no made-up ETAs.')

// the true negative both versions must keep: holds omitted really means zero holds
assert.equal(r.noHolds.before.els['holds-count'].textContent, '0 active holds')
assert.equal(r.noHolds.fixed.els['holds-count'].textContent, '0 active holds')
console.log('noHolds        | BOTH: "0 active holds" — the API omits the key when none exist; `?? []` is TRUE.')

console.log('\nclaims hold: the fallbacks forge exactly as the lesson says; the fixed dashboard can only tell the truth or say so loudly.')
