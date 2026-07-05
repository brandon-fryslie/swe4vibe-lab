// weekly traffic report generator
export const week = [
  { path: '/home',    visits: 4120 },
  { path: '/pricing', visits: 980 },
  { path: '/blog/ai', visits: 2210 },
  { path: '/careers', visits: 0 },
  { path: '/docs',    visits: 640 },
  { path: '/beta',    visits: 0 },
]

export function report(rows, opts = {}) {
  const out = [opts.title || 'WEEKLY TRAFFIC']
  let list = rows
  if (opts.topThree) list = [...list].sort((a, b) => b.visits - a.visits).slice(0, 3)
  if (opts.hideEmpty) list = list.filter(r => r.visits > 0)
  const total = list.reduce((s, r) => s + r.visits, 0)
  if (opts.header) {
    let h = 'PAGE | VISITS'
    if (opts.percents) h += ' | SHARE'
    out.push(h)
  }
  for (const r of list) {
    let line = r.path + ' | ' + r.visits
    if (opts.percents) line += ' | ' + Math.round((r.visits / total) * 100) + '%'
    out.push(line)
  }
  if (opts.totalRow) out.push('TOTAL | ' + total)
  return out.join('\n')
}
