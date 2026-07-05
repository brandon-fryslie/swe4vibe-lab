// The lesson's claim, executed:
//   before — two searches in flight share one finish line (the screen) and no
//     line of code says who wins. In-order responses look correct (Tuesday);
//     when the older response lands last, the screen ends on the stale answer
//     (Wednesday). Same code, both runs.
//   after — every request takes an id; only the newest may write. The same
//     out-of-order arrival cannot put the stale answer on screen.
// Exit 0 iff all three claims hold when actually run.
//
// Determinism note: the "network" here is manually-resolved promises, so the
// arrival order is forced by the test, not by real timers. The race is the
// interleaving itself — no sleeps, no luck.
import assert from 'node:assert/strict'

const deferred = () => {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

// ---------- BEFORE: whoever finishes last wins, because nobody decided ----------
let shown = null
async function onType(q, response) {
  const data = await response
  shown = data // ← there is no line that says who wins; this is what happens instead
}

// Tuesday: fast network — responses arrive in the order typed
{
  const reqB = deferred()
  const reqBo = deferred()
  const inFlight = [onType('b', reqB.promise), onType('bo', reqBo.promise)]
  reqB.resolve(['results for "b"'])
  reqBo.resolve(['results for "bo"'])
  await Promise.all(inFlight)
}
console.log('BEFORE, Tuesday (in-order arrival):  ', shown[0])
assert.equal(shown[0], 'results for "bo"') // looks correct — Tuesday is not proof

// Wednesday: the "b" request hit a slow moment and lands last
{
  const reqB = deferred()
  const reqBo = deferred()
  const inFlight = [onType('b', reqB.promise), onType('bo', reqBo.promise)]
  reqBo.resolve(['results for "bo"'])
  reqB.resolve(['results for "b"']) // stale response arrives last…
  await Promise.all(inFlight)
}
console.log('BEFORE, Wednesday (stale lands last):', shown[0], ' ← the user typed "bo"')
assert.equal(shown[0], 'results for "b"') // …and stomps the screen

// ---------- AFTER: the finish line has an owner ----------
let latest = 0
let shown2 = null
async function onType2(q, response) {
  const requestId = ++latest
  const data = await response
  if (requestId !== latest) return // a newer search owns the screen now
  shown2 = data
}

// the exact Wednesday interleaving again
{
  const reqB = deferred()
  const reqBo = deferred()
  const inFlight = [onType2('b', reqB.promise), onType2('bo', reqBo.promise)]
  reqBo.resolve(['results for "bo"'])
  reqB.resolve(['results for "b"'])
  await Promise.all(inFlight)
}
console.log('AFTER,  Wednesday (stale lands last):', shown2[0])
assert.equal(shown2[0], 'results for "bo"') // newest wins by rule, not by arrival luck

console.log('\nclaims hold: the before is correct only when arrival order is lucky;')
console.log('the after decides the winner in code, so the dice have nothing left to decide.')
