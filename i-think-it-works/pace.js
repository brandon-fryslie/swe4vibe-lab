// running log — NEW FEATURE just delivered: pace calculator
// paceFor(distanceMiles, timeStr) → e.g. paceFor(3.1, '25:00') → '8:04 per mile'

function parseMinutes(timeStr) {
  const [m, s] = timeStr.split(':')
  return Number(m) + Number(s) / 60
}

function paceFor(distanceMiles, timeStr) {
  const totalMin = parseMinutes(timeStr)
  const pace = totalMin / distanceMiles
  const m = Math.floor(pace)
  const s = Math.round((pace - m) * 60)
  return m + ':' + String(s).padStart(2, '0') + ' per mile'
}
