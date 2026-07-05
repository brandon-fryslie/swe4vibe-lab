import * as p from './player-fixed.js'
import assert from 'node:assert/strict'

// same-display checks on fresh state
assert.equal(p.nowPlayingBar(), 'Golden Hour — Nia (vol 7)')
assert.deepEqual(p.upNext(), ['Static', 'Blue Doors', 'Undertow'])
assert.deepEqual(p.longestFirstView(), [
  'Blue Doors (305s)', 'Undertow (243s)', 'Golden Hour (214s)', 'Static (187s)', 'Last Bus (166s)',
])
assert.equal(p.canImport('a.flac'), true)
assert.equal(p.canImport('a.wav'), false)

// 1. the view no longer reorders the queue
assert.equal(p.nowPlayingBar(), 'Golden Hour — Nia (vol 7)')
assert.deepEqual(p.upNext(), ['Static', 'Blue Doors', 'Undertow'])

// 2. _state is a detached snapshot
const s = p._state()
assert.deepEqual(s, {
  queue: [
    { title: 'Golden Hour',  artist: 'Nia',      secs: 214 },
    { title: 'Static',       artist: 'Wolfpack', secs: 187 },
    { title: 'Blue Doors',   artist: 'Nia',      secs: 305 },
    { title: 'Undertow',     artist: 'Merit',    secs: 243 },
    { title: 'Last Bus',     artist: 'Wolfpack', secs: 166 },
  ],
  volume: 7,
  settings: { repeat: false, crossfadeSecs: 2 },
})
s.queue.push({ title: 'INJECTED', artist: 'X', secs: 1 })
s.queue[0].title = 'HACKED'
s.settings.crossfadeSecs = 99
assert.equal(p._state().queue.length, 5)
assert.equal(p.nowPlayingBar(), 'Golden Hour — Nia (vol 7)')
assert.equal(p._state().settings.crossfadeSecs, 2)

// 3. addToQueue: length return unchanged; caller reach-back severed
const t = { title: 'Sixth', artist: 'Z', secs: 3 }
assert.equal(p.addToQueue(t), 6)
t.title = 'MUTATED AFTER ADD'
assert.equal(p._state().queue.at(-1).title, 'Sixth')

// 4. partyMode / sleepTimer displays and effects
assert.equal(p.partyMode(), 'party on')
assert.equal(p.nowPlayingBar(), 'Golden Hour — Nia (vol 10)')
assert.deepEqual(p._state().settings, { repeat: false, crossfadeSecs: 0 })
assert.equal(p.sleepTimer(), 'winding down')
assert.equal(p.nowPlayingBar(), 'Golden Hour — Nia (vol 3)')
assert.deepEqual(p._state().settings, { repeat: false, crossfadeSecs: 0 })

// 5. shuffleButton still reorders the live queue (its job) and returns the new head
const head = p.shuffleButton()
assert.equal(head, p._state().queue[0].title)
assert.equal(p.nowPlayingBar().startsWith(head), true)
// queue contents preserved as a multiset
assert.deepEqual(
  p._state().queue.map(x => x.title).sort(),
  ['Blue Doors', 'Golden Hour', 'Last Bus', 'Sixth', 'Static', 'Undertow'],
)

// 6. shuffle uniformity smoke test: head varies across runs (statistical, in-process reshuffles)
const heads = new Set()
for (let i = 0; i < 200; i++) heads.add(p.shuffleButton())
assert.equal(heads.size, 6)

console.log('all checks passed')
