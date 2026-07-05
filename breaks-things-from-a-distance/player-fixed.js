// music player

const SUPPORTED_FORMATS = Object.freeze(['mp3', 'flac', 'ogg'])

// ---------------------------------------------------------------------------
// Owned state. [LAW:no-shared-mutable-globals] Only the owner functions in
// this block may touch `state`. Everything below the divider goes through
// them, and every value they hand out is a copy or a primitive — nothing a
// caller receives can reach back into `state`.
// ---------------------------------------------------------------------------
const state = {
  queue: [
    { title: 'Golden Hour',  artist: 'Nia',      secs: 214 },
    { title: 'Static',       artist: 'Wolfpack', secs: 187 },
    { title: 'Blue Doors',   artist: 'Nia',      secs: 305 },
    { title: 'Undertow',     artist: 'Merit',    secs: 243 },
    { title: 'Last Bus',     artist: 'Wolfpack', secs: 166 },
  ],
  volume: 7,
  settings: { repeat: false, crossfadeSecs: 2 },
}

const copyTrack = (track) => ({ ...track })

// -- queue owner --
function readQueue() {
  return state.queue.map(copyTrack)
}

function trackAt(index) {
  const track = state.queue[index]
  // [LAW:no-silent-failure] an out-of-range index stays undefined so the
  // caller fails the same loud way the pre-refactor code did, instead of
  // getting a fabricated empty track.
  return track === undefined ? undefined : copyTrack(track)
}

function enqueue(track) {
  // Store a copy so the caller's later mutations can't rewrite the queue.
  state.queue.push(copyTrack(track))
  return state.queue.length
}

function shuffleQueue() {
  // Fisher-Yates: the one sanctioned in-place reorder of the queue.
  for (let i = state.queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]]
  }
}

// -- volume owner --
function readVolume() {
  return state.volume
}

function writeVolume(level) {
  state.volume = level
}

// -- settings owner --
function readSettings() {
  return { ...state.settings }
}

function writeRepeat(repeat) {
  state.settings.repeat = repeat
}

function writeCrossfade(secs) {
  state.settings.crossfadeSecs = secs
}

// ---------------------------------------------------------------------------
// Public API — reads and writes only via the owner functions above.
// ---------------------------------------------------------------------------

export function canImport(filename) {
  return SUPPORTED_FORMATS.some(ext => filename.endsWith('.' + ext))
}

export function nowPlayingBar() {
  const current = trackAt(0)
  return current.title + ' — ' + current.artist + ' (vol ' + readVolume() + ')'
}

export function upNext() {
  return readQueue().slice(1, 4).map(t => t.title)
}

export function shuffleButton() {
  shuffleQueue()
  return trackAt(0).title
}

export function longestFirstView() {
  // Sorts a copy: a view must never reorder the live queue.
  return readQueue()
    .sort((a, b) => b.secs - a.secs)
    .map(t => t.title + ' (' + t.secs + 's)')
}

export function partyMode() {
  writeVolume(10)
  writeCrossfade(0)
  return 'party on'
}

export function sleepTimer() {
  writeVolume(3)
  writeRepeat(false)
  return 'winding down'
}

export function addToQueue(track) {
  return enqueue(track)
}

export function _state() {
  // A detached snapshot: mutating it changes nothing inside the player.
  return { queue: readQueue(), volume: readVolume(), settings: readSettings() }
}
