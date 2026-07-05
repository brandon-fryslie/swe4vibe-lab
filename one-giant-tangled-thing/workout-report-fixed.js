// weekly workout report
//
// Pure pipeline: parse -> summarize -> derive -> format. The only part that
// touches the world is print() at the bottom. [LAW:effects-at-boundaries]

import { pathToFileURL } from 'node:url'

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

// -- Job 1: parse ------------------------------------------------------------
// One raw log line -> one structured entry.
// [LAW:types-are-the-program] the entry is a discriminated union on `kind`,
// so nothing downstream re-inspects raw strings or guesses which fields exist.
function parseEntry(line) {
  const [day, type, mins, dist] = line.split(' ')
  return type === 'rest'
    ? { kind: 'rest', day }
    : { kind: 'workout', day, type, mins: parseInt(mins, 10), dist: parseFloat(dist) }
}

// -- Job 2: summarize --------------------------------------------------------
// Parsed entries -> weekly totals. Pure fold; no formatting, no printing.
function summarize(entries) {
  const workouts = entries.filter((e) => e.kind === 'workout')
  const byType = {}
  for (const w of workouts) {
    byType[w.type] = (byType[w.type] || 0) + w.mins
  }
  return {
    totalMin: workouts.reduce((sum, w) => sum + w.mins, 0),
    // [LAW:one-source-of-truth] the original hardcoded 5; the active-day
    // count is derivable from the data, so derive it.
    activeDays: workouts.length,
    byType,
    runMin: workouts.filter((w) => w.type === 'run').reduce((s, w) => s + w.mins, 0),
    runMiles: workouts.filter((w) => w.type === 'run').reduce((s, w) => s + w.dist, 0),
  }
}

// -- Job 3: derived stats ----------------------------------------------------
// Each takes summary numbers, hands back one number/value. Pure.
function avgPerActiveDay(summary) {
  return summary.totalMin / summary.activeDays
}

function runPace(summary) {
  return summary.runMin / summary.runMiles
}

function goalRemaining(goalMin, summary) {
  return goalMin - summary.totalMin
}

function mostTime(byType) {
  return Object.entries(byType).reduce(
    (best, [type, mins]) => (mins > best.mins ? { type, mins } : best),
    { type: '', mins: 0 },
  )
}

// -- Job 4: format -----------------------------------------------------------
// Values -> display lines. Owns every string the report shows; computes nothing.
function formatEntry(entry) {
  return entry.kind === 'rest'
    ? entry.day + ': rest day'
    : entry.day + ': ' + entry.type + ' ' + entry.mins + ' min, ' + entry.dist + ' mi'
}

function formatSummary(summary, goalMin) {
  const remaining = goalRemaining(goalMin, summary)
  const best = mostTime(summary.byType)
  return [
    'total: ' + summary.totalMin + ' min, avg ' + avgPerActiveDay(summary).toFixed(1) + ' min per active day',
    'run pace: ' + runPace(summary).toFixed(1) + ' min/mi',
    remaining >= 0 ? remaining + ' min left to weekly goal' : 'goal beaten!',
    'most time: ' + best.type + ' (' + best.mins + ' min)',
  ]
}

// -- Job 5: assemble ---------------------------------------------------------
// Raw log + goal -> the complete report as one string. Still pure: callers
// decide what to do with it.
function renderReport(rawLog, goalMin) {
  const entries = rawLog.map(parseEntry)
  return ['== Week in Review ==', ...entries.map(formatEntry), ...formatSummary(summarize(entries), goalMin)].join('\n')
}

// -- Edge: print -------------------------------------------------------------
// The one part that acts on the world.
function print(report) {
  console.log(report)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  print(renderReport(log, GOAL_MIN))
}

export {
  log,
  GOAL_MIN,
  parseEntry,
  summarize,
  avgPerActiveDay,
  runPace,
  goalRemaining,
  mostTime,
  formatEntry,
  formatSummary,
  renderReport,
}
