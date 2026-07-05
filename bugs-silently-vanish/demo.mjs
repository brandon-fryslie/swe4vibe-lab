// The lesson's claims, executed:
//   stage 1 — the real bug (a typo'd key) fails LOUD: a TypeError naming the
//     exact operation. Five minutes from dead.
//   stage 2 — "fix the crash": `if (!user) return` stops the crash and the
//     greeting silently renders blank for a logged-in user, forever. The typo
//     is still in the file. No error anywhere.
//   after — fix the value upstream; genuine absence (logged out) gets a real
//     arm the user can see. Both paths put something on the screen.
//   specimen — weather.js reads `apiResponse.forecasts` (the API field is
//     `forecast` — see sample-response.json, the truth fixture); its guards
//     suppress the typo on every render, so the page is quietly blank with
//     zero errors. weather-fixed.js renders everything from the same fixture,
//     and keeps the ONE genuine optional (`alert`, omitted when none is
//     active) as a real two-armed state.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// ---------- the greeting (the lesson's example) ----------
const elements = { greeting: { textContent: '' } }
const fakeDocument = { getElementById: (id) => elements[id] }
const session = { currentUser: { name: 'Sam' } }

// stage 1: the honest crash
function renderGreetingV1() {
  const user = session.curentUser   // ← the real bug: typo'd key, always undefined
  fakeDocument.getElementById('greeting').textContent = 'Welcome back, ' + user.name
}
assert.throws(renderGreetingV1, TypeError)
try { renderGreetingV1() } catch (e) {
  console.log('stage 1 (the real bug, unguarded): THROWS —', e.constructor.name + ':', e.message)
}

// stage 2: "fix the crash"
function renderGreetingV2() {
  const user = session.curentUser   // the typo is still here
  if (!user) return                 // ← the "fix"
  fakeDocument.getElementById('greeting').textContent = 'Welcome back, ' + user.name
}
elements.greeting.textContent = ''
assert.doesNotThrow(renderGreetingV2)
renderGreetingV2()
assert.equal(elements.greeting.textContent, '')   // blank, for a LOGGED-IN user
console.log('stage 2 (guarded): crashed? false | greeting on screen: ""',
            '← blank for a logged-in user, no error, typo untouched')

// after: value fixed upstream; genuine absence gets a real arm
function renderGreetingV3() {
  const user = session.currentUser  // ← the actual fix
  fakeDocument.getElementById('greeting').textContent =
    user ? 'Welcome back, ' + user.name : 'Sign in to get started'
}
renderGreetingV3()
assert.equal(elements.greeting.textContent, 'Welcome back, Sam')
console.log('AFTER, logged in:  greeting =', JSON.stringify(elements.greeting.textContent))
session.currentUser = null          // logged out — absence that MEANS something
renderGreetingV3()
assert.equal(elements.greeting.textContent, 'Sign in to get started')
console.log('AFTER, logged out: greeting =', JSON.stringify(elements.greeting.textContent),
            '← both arms do something; nothing is silently skipped')

// ---------- the specimen: the quietly blank weather page ----------
const fixture = JSON.parse(readFileSync(new URL('./sample-response.json', import.meta.url), 'utf8'))

const freshElements = () => ({
  'today-temp':   { textContent: '' },
  'today-cond':   { textContent: '' },
  'week-list':    { innerHTML: '' },
  'city-name':    { textContent: '' },
  'alert-banner': { textContent: '', hidden: false },
})
const load = (file, els) => {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
  const doc = { getElementById: (id) => els[id] }
  return new Function('document',
    code + '\n;return { loadWeather, renderToday, renderWeek, renderHeader, renderAlertBanner };')(doc)
}

// before: run the whole page against the real response shape
const elsBefore = freshElements()
const before = load('./weather.js', elsBefore)
assert.doesNotThrow(() => {
  before.loadWeather(fixture)
  before.renderToday()
  before.renderWeek()
  before.renderHeader()
  before.renderAlertBanner(fixture)
})
assert.equal(elsBefore['today-temp'].textContent, '')  // quietly blank
assert.equal(elsBefore['week-list'].innerHTML, '')     // quietly blank
assert.equal(elsBefore['city-name'].textContent, 'Portland') // the header works — worse:
console.log('\nspecimen BEFORE: zero errors, city renders "Portland"…')
console.log('  today-temp:', JSON.stringify(elsBefore['today-temp'].textContent),
            '| week-list:', JSON.stringify(elsBefore['week-list'].innerHTML))
console.log('  the file reads `.forecasts`; the API ships `forecast` (sample-response.json).')
console.log('  every render guard bails silently — a half-working page with nothing to google.')

// after: same fixture, everything renders; the one genuine optional keeps a real else
const elsAfter = freshElements()
elsAfter['alert-banner'].textContent = 'Flood watch until Friday' // stale banner from a previous alert
const after = load('./weather-fixed.js', elsAfter)
assert.doesNotThrow(() => after.loadWeather(fixture))
assert.equal(elsAfter['today-temp'].textContent, '78° / 58°')
assert.equal(elsAfter['today-cond'].textContent, 'Sunny')
assert.ok(elsAfter['week-list'].innerHTML.includes('Mon: 78°'))
assert.equal(elsAfter['city-name'].textContent, 'Portland')
// no `alert` key in the fixture = genuine absence: the else arm CLEARS the stale banner
assert.equal(elsAfter['alert-banner'].hidden, true)
assert.equal(elsAfter['alert-banner'].textContent, '')
console.log('specimen AFTER: temps, week, and city all render from the same fixture.')

// and when an alert IS active, the same two-armed state shows it
const withAlert = { ...fixture, alert: { headline: 'Heat advisory 2–8pm' } }
after.loadWeather(withAlert)
assert.equal(elsAfter['alert-banner'].hidden, false)
assert.equal(elsAfter['alert-banner'].textContent, 'Heat advisory 2–8pm')
console.log('  alert omitted → banner cleared and hidden; alert present → banner shows.')
console.log('  absence that MEANS something kept its check — with both arms doing something.')

console.log('\nclaims hold: the guards hide the typo exactly as the lesson says; upstream-fixed code cannot go quietly blank.')
