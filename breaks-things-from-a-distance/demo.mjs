// The lesson's claim, executed:
//   before — a shared products array with no owner. The AI's new Top Rated tab
//     renders with products.sort(), which returns the sorted array AND mutates
//     the shared one: merely VIEWING the tab corrupts New Arrivals and the
//     banner — two screens whose code did not change, zero errors.
//   after — one owner, readers get copies: 100 top-rated views, arrivals
//     never move.
//   specimen — player.js is the whole disease family in one file: the
//     view-that-writes, the live-reference "snapshot" (with one stale field —
//     two lies in one shape), the push(callerObject) reach-back, plus the
//     sanctioned mutation (shuffle) and an immutable config that must survive
//     the fix. probe-fixed.mjs asserts player-fixed.js against all of it.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as player from './player.js'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- BEFORE (lesson storefront) ----------
const products = [
  { name: 'Desk Mat', rating: 4.1 },   // insertion order = newest first
  { name: 'Lamp',     rating: 4.8 },
  { name: 'Notebook', rating: 3.9 },
  { name: 'Pen Set',  rating: 4.5 },
]

const newArrivalsScreen = () => products.map(p => p.name).join(', ')
const featuredBanner   = () => 'New this week: ' + products[0].name
// the AI's new tab:
const topRatedScreen   = () => products.sort((a, b) => b.rating - a.rating).map(p => p.name).join(', ')

console.log('BEFORE — fresh session:')
console.log('  new arrivals:', newArrivalsScreen())
assert.equal(newArrivalsScreen(), 'Desk Mat, Lamp, Notebook, Pen Set')
assert.equal(featuredBanner(), 'New this week: Desk Mat')
console.log('  banner      :', featuredBanner())
console.log('  (user opens the Top Rated tab…)')
console.log('  top rated   :', topRatedScreen())
console.log('  …then goes back:')
console.log('  new arrivals:', newArrivalsScreen(), '  ← corrupted, code untouched')
console.log('  banner      :', featuredBanner(), '        ← wrong product, code untouched')
// the harm at a distance, asserted: both screens broke without their code changing
assert.equal(newArrivalsScreen(), 'Lamp, Pen Set, Desk Mat, Notebook')
assert.equal(featuredBanner(), 'New this week: Lamp')

// ---------- AFTER: one owner, readers get copies ----------
const catalog = (() => {
  const list = [
    { name: 'Desk Mat', rating: 4.1 },
    { name: 'Lamp',     rating: 4.8 },
    { name: 'Notebook', rating: 3.9 },
    { name: 'Pen Set',  rating: 4.5 },
  ]
  return {
    newestFirst: () => [...list],
    byRating:    () => [...list].sort((a, b) => b.rating - a.rating),
  }
})()

const arrivals2 = () => catalog.newestFirst().map(p => p.name).join(', ')
const banner2   = () => 'New this week: ' + catalog.newestFirst()[0].name
const topRated2 = () => catalog.byRating().map(p => p.name).join(', ')

console.log('\nAFTER — same sequence:')
console.log('  top rated   :', topRated2())
for (let i = 0; i < 100; i++) topRated2()
console.log('  new arrivals after 100 top-rated views:', arrivals2())
assert.equal(arrivals2(), 'Desk Mat, Lamp, Notebook, Pen Set')
assert.equal(banner2(), 'New this week: Desk Mat')

// ---------- the specimen: player.js, the disease family live ----------
console.log('\nspecimen (player.js):')

// fresh state is correct
assert.equal(player.nowPlayingBar(), 'Golden Hour — Nia (vol 7)')
assert.deepEqual(player.upNext(), ['Static', 'Blue Doors', 'Undertow'])

// 1. a read-looking view reorders the live queue: viewing changes playback
player.longestFirstView()
assert.equal(player.nowPlayingBar(), 'Blue Doors — Nia (vol 7)')
assert.deepEqual(player.upNext(), ['Undertow', 'Golden Hour', 'Static'])
console.log('  viewing "longest first" changed the now-playing track:', player.nowPlayingBar())

// 2. the "snapshot" hands out live references: any caller is a writer
const snap = player._state()
snap.queue.push({ title: 'INJECTED', artist: 'X', secs: 1 })
snap.settings.crossfadeSecs = 99
assert.ok(player._state().queue.some(t => t.title === 'INJECTED'))
assert.equal(player._state().settings.crossfadeSecs, 99)
console.log('  pushing into the snapshot injected a real track; snapshot settings write went live')

// 2b. …while volume in the same snapshot is a frozen copy — two lies in one shape
const snap2 = player._state()
player.partyMode()
assert.equal(snap2.volume, 7)                       // stale copy
assert.equal(snap2.settings.crossfadeSecs, 0)       // live reference
console.log('  the same snapshot is half-live, half-stale: settings moved, volume did not')

// 3. addToQueue captures the caller's object: edit-after-add rewrites history
const track = { title: 'Original Title', artist: 'Z', secs: 3 }
player.addToQueue(track)
track.title = 'MUTATED AFTER ADD'
assert.equal(player._state().queue.at(-1).title, 'MUTATED AFTER ADD')
console.log('  mutating a track after adding it rewrote the stored queue entry')

// 4. true negative: the frozen-format list and its reader are fine as-is
assert.equal(player.canImport('song.flac'), true)
assert.equal(player.canImport('song.wav'), false)

// ---------- the fixed twin, probed in full ----------
// probe-fixed.mjs asserts: views sort copies, the snapshot is detached, the
// reach-back is severed, partyMode/sleepTimer still work, AND the sanctioned
// mutation (shuffle) survives as the owner's writer.
const probe = spawnSync(process.execPath, [join(here, 'probe-fixed.mjs')], { encoding: 'utf8' })
if (probe.status !== 0) {
  process.stdout.write(probe.stdout)
  process.stderr.write(probe.stderr)
}
assert.equal(probe.status, 0)
console.log('\nplayer-fixed.js passed the full probe: readers get copies, writers are named, shuffle still shuffles')

console.log('\nclaims hold: with no owner, anything can break anything from a distance; with one owner, the suspect list is the owner\'s writers.')
