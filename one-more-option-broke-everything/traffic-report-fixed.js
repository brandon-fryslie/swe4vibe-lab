// weekly traffic report generator
export const week = [
  { path: '/home',    visits: 4120 },
  { path: '/pricing', visits: 980 },
  { path: '/blog/ai', visits: 2210 },
  { path: '/careers', visits: 0 },
  { path: '/docs',    visits: 640 },
  { path: '/beta',    visits: 0 },
]

// [LAW:dataflow-not-control-flow] The legacy flags are translated exactly once,
// at the boundary, into plain values — a comparator, a number, a column list,
// a footer list — and one render path reads them. The next variation (top five,
// a bounce-rate column, a subtotal footer) is a new value here, not a new fork.

// [LAW:no-ambient-temporal-coupling] ()=>0 relies on Array.prototype.sort being
// stable (guaranteed since ES2019) to preserve caller row order.
const BY_INPUT_ORDER = () => 0
const BY_VISITS_DESC = (a, b) => b.visits - a.visits

const PAGE   = { header: 'PAGE',   cell: (r) => String(r.path) }
const VISITS = { header: 'VISITS', cell: (r) => String(r.visits) }
// [LAW:one-source-of-truth] exception, preserved from the legacy code: `total`
// is the sum of the *displayed* rows, so SHARE (and the TOTAL footer) shift
// when topThree trims the list, and SHARE is 'NaN%' when the displayed total
// is 0. Flagged in report.md rather than silently redefined.
const SHARE  = { header: 'SHARE',  cell: (r, total) => Math.round((r.visits / total) * 100) + '%' }

const TOTAL_FOOTER = (total) => 'TOTAL | ' + total

function plan(opts) {
  return {
    title: opts.title || 'WEEKLY TRAFFIC',
    order: opts.topThree ? BY_VISITS_DESC : BY_INPUT_ORDER,
    limit: opts.topThree ? 3 : Infinity,
    minVisits: opts.hideEmpty ? 0 : -Infinity,
    columns: opts.percents ? [PAGE, VISITS, SHARE] : [PAGE, VISITS],
    headerRows: opts.header ? 1 : 0,
    footers: opts.totalRow ? [TOTAL_FOOTER] : [],
  }
}

export function report(rows, opts = {}) {
  const p = plan(opts)
  // sort → slice → filter mirrors the legacy sequencing (topThree before
  // hideEmpty); the two commute here because the sort puts positives first,
  // but the order is kept explicit rather than left as folklore.
  const list = [...rows]
    .sort(p.order)
    .slice(0, p.limit)
    .filter((r) => r.visits > p.minVisits)
  const total = list.reduce((s, r) => s + r.visits, 0)
  const headerLine = p.columns.map((c) => c.header).join(' | ')
  return [
    p.title,
    ...Array(p.headerRows).fill(headerLine),
    ...list.map((r) => p.columns.map((c) => c.cell(r, total)).join(' | ')),
    ...p.footers.map((f) => f(total)),
  ].join('\n')
}
