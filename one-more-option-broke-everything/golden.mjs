// My golden-output harness for the broken version: runs all 32 combos of the five
// boolean options against the original file (or a fixed file passed as argv)
// and prints a stable digest, so before/after can be diffed combo by combo.
const file = process.argv[2] || './traffic-report.js'
const { week, report } = await import(file)

const FLAGS = ['header', 'percents', 'topThree', 'hideEmpty', 'totalRow']
for (let mask = 0; mask < 32; mask++) {
  const opts = {}
  FLAGS.forEach((f, i) => { if (mask & (1 << i)) opts[f] = true })
  const label = FLAGS.filter(f => opts[f]).join('+') || '(none)'
  console.log('### ' + label)
  console.log(report(week, opts))
}
