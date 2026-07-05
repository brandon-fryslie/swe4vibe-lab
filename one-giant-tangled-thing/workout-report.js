// weekly workout report
const log = [
  'mon run 30 3.2',
  'tue rest',
  'wed bike 45 11.0',
  'thu run 25 2.8',
  'fri swim 40 1.2',
  'sat run 50 5.5',
  'sun rest',
]

const GOAL_MIN = 200

function weeklyReport() {
  console.log('== Week in Review ==')
  let totalMin = 0
  let runMiles = 0
  let runMin = 0
  const byType = {}
  for (const line of log) {
    const bits = line.split(' ')
    if (bits[1] === 'rest') {
      console.log(bits[0] + ': rest day')
      continue
    }
    const mins = parseInt(bits[2], 10)
    const dist = parseFloat(bits[3])
    totalMin += mins
    byType[bits[1]] = (byType[bits[1]] || 0) + mins
    if (bits[1] === 'run') {
      runMiles += dist
      runMin += mins
    }
    console.log(bits[0] + ': ' + bits[1] + ' ' + mins + ' min, ' + dist + ' mi')
  }
  const avg = (totalMin / 5).toFixed(1)
  console.log('total: ' + totalMin + ' min, avg ' + avg + ' min per active day')
  const pace = (runMin / runMiles).toFixed(1)
  console.log('run pace: ' + pace + ' min/mi')
  const remaining = (GOAL_MIN - totalMin).toFixed(0)
  console.log(remaining >= 0 ? remaining + ' min left to weekly goal' : 'goal beaten!')
  let best = ''
  let bestMin = 0
  for (const t in byType) {
    if (byType[t] > bestMin) {
      bestMin = byType[t]
      best = t
    }
  }
  console.log('most time: ' + best + ' (' + bestMin + ' min)')
}

weeklyReport()
