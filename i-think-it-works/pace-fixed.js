// running log — pace calculator
// paceFor(distanceMiles, timeStr) → e.g. paceFor(3.1, '25:00') → '8:04 per mile'
// timeStr is 'M:SS' or 'H:MM:SS'; invalid input throws rather than returning
// a plausible-looking wrong answer. [LAW:no-silent-failure]

// One shape for legal time strings: optional hours, then minutes, then
// two-digit seconds 00–59. Minutes are unbounded without hours ('85:00'),
// 0–59 with them. [LAW:types-are-the-program]
const TIME_SHAPE = /^(?:(\d+):)?(\d+):([0-5]\d)$/

function parseTotalSeconds(timeStr) {
  if (typeof timeStr !== 'string') {
    throw new TypeError(`timeStr must be a string like '25:00', got ${typeof timeStr}`)
  }
  const match = TIME_SHAPE.exec(timeStr)
  if (match === null) {
    throw new RangeError(`timeStr must be 'M:SS' or 'H:MM:SS' with seconds 00-59, got '${timeStr}'`)
  }
  const [, h, m, s] = match
  const hours = h === undefined ? 0 : Number(h)
  const minutes = Number(m)
  if (h !== undefined && minutes > 59) {
    throw new RangeError(`minutes must be 00-59 when hours are given, got '${timeStr}'`)
  }
  return hours * 3600 + minutes * 60 + Number(s)
}

function paceFor(distanceMiles, timeStr) {
  if (typeof distanceMiles !== 'number' || !Number.isFinite(distanceMiles) || distanceMiles <= 0) {
    throw new RangeError(`distanceMiles must be a finite number > 0, got ${JSON.stringify(distanceMiles)}`)
  }
  const totalSeconds = parseTotalSeconds(timeStr)
  if (totalSeconds === 0) {
    throw new RangeError('elapsed time must be greater than zero')
  }
  // Round whole pace-seconds first so seconds can never render as ':60'.
  const paceSeconds = Math.round(totalSeconds / distanceMiles)
  const m = Math.floor(paceSeconds / 60)
  const s = paceSeconds % 60
  return m + ':' + String(s).padStart(2, '0') + ' per mile'
}
