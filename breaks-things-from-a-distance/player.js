// music player
let queue = [
  { title: 'Golden Hour',  artist: 'Nia',      secs: 214 },
  { title: 'Static',       artist: 'Wolfpack', secs: 187 },
  { title: 'Blue Doors',   artist: 'Nia',      secs: 305 },
  { title: 'Undertow',     artist: 'Merit',    secs: 243 },
  { title: 'Last Bus',     artist: 'Wolfpack', secs: 166 },
]

let volume = 7

const settings = { repeat: false, crossfadeSecs: 2 }

const SUPPORTED_FORMATS = ['mp3', 'flac', 'ogg']

export function canImport(filename) {
  return SUPPORTED_FORMATS.some(ext => filename.endsWith('.' + ext))
}

export function nowPlayingBar() {
  return queue[0].title + ' — ' + queue[0].artist + ' (vol ' + volume + ')'
}

export function upNext() {
  return queue.slice(1, 4).map(t => t.title)
}

export function shuffleButton() {
  queue.sort(() => Math.random() - 0.5)
  return queue[0].title
}

export function longestFirstView() {
  return queue.sort((a, b) => b.secs - a.secs).map(t => t.title + ' (' + t.secs + 's)')
}

export function partyMode() {
  volume = 10
  settings.crossfadeSecs = 0
  return 'party on'
}

export function sleepTimer() {
  volume = 3
  settings.repeat = false
  return 'winding down'
}

export function addToQueue(track) {
  queue.push(track)
  return queue.length
}

export function _state() {
  return { queue, volume, settings }
}
