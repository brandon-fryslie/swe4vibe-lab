// Runs every specimen's demo and reports the verdict.
// Exit 0 iff every demo exits 0. A demo exiting non-zero means a claimed
// before-failure or after-immunity did not hold when executed.
import { readdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const specimens = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(root, d.name, 'demo.mjs')))
  .map((d) => d.name)
  .sort()

// [LAW:no-silent-failure] an empty run must not read as a green run
if (specimens.length === 0) {
  console.error('FAIL: no specimens found (no directory contains a demo.mjs)')
  process.exit(1)
}

let failed = 0
for (const name of specimens) {
  const r = spawnSync(process.execPath, ['demo.mjs'], { cwd: join(root, name), encoding: 'utf8' })
  if (r.status === 0) {
    console.log(`PASS ${name}`)
  } else {
    failed++
    // [LAW:no-silent-failure] a spawn that never ran (status null, error set)
    // must report as its own failure mode, not crash the report
    console.log(`FAIL ${name} (exit ${r.status}${r.signal ? `, signal ${r.signal}` : ''})`)
    if (r.error) console.log(`  spawn error: ${r.error.message}`)
    process.stdout.write(r.stdout ?? '')
    process.stderr.write(r.stderr ?? '')
  }
}

console.log(`\n${specimens.length - failed}/${specimens.length} specimens hold their claims`)
process.exit(failed === 0 ? 0 : 1)
