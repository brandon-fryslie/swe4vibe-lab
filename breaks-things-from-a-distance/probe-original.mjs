import * as p from './player.js'

console.log('--- fresh state ---')
console.log('nowPlaying:', p.nowPlayingBar())
console.log('upNext:', p.upNext())

console.log('--- call longestFirstView (a read-only "view") ---')
console.log('view:', p.longestFirstView())
console.log('nowPlaying AFTER view:', p.nowPlayingBar())
console.log('upNext AFTER view:', p.upNext())

console.log('--- _state leak: push through the snapshot ---')
const s = p._state()
s.queue.push({ title: 'INJECTED', artist: 'X', secs: 1 })
s.settings.crossfadeSecs = 99
console.log('queue length seen by addToQueue return:', p.addToQueue({ title: 'legit', artist: 'Y', secs: 2 }))
console.log('settings after snapshot mutation:', p._state().settings)

console.log('--- addToQueue reach-back: mutate track after adding ---')
const t = { title: 'Original Title', artist: 'Z', secs: 3 }
p.addToQueue(t)
t.title = 'MUTATED AFTER ADD'
console.log('last queued track:', p._state().queue.at(-1))
