// The lesson's claim, executed:
//   before — four separate state variables (isLoading, isError, results, error)
//     can combine into states that should be impossible; the most ordinary
//     sequence in the world (one search fails, the next succeeds) ends with the
//     error banner AND the results on screen together.
//   after — one status value; that combination is not fixed, it is unwritable.
// Exit 0 iff both claims hold when actually run.
import assert from 'node:assert/strict'

const fakeFetch = (q) =>
  q === 'boots'
    ? Promise.resolve({ ok: false })
    : Promise.resolve({ ok: true, json: async () => [`result for ${q}`] })

// ---------- BEFORE: four variables that are supposed to move together ----------
let isLoading = false
let isError = false
let results = null
let error = null

async function searchBefore(q) {
  isLoading = true
  const res = await fakeFetch(q)
  if (!res.ok) {
    isError = true
    error = 'Search failed'
  } else {
    results = await res.json()
  }
  isLoading = false
}

const showsBefore = () => ({
  spinner: isLoading,
  errorBanner: isError,
  resultsList: results !== null,
})

await searchBefore('boots') // fails
await searchBefore('boot')  // succeeds — and knows nothing about the error flag
const b = showsBefore()
console.log('BEFORE — search fails, then a search succeeds:', b)
console.log('  error banner AND results on screen together — the illegal state, reached')
console.log('  by the most ordinary sequence there is. No patch was forgotten; there was')
console.log('  simply nothing making four variables move together.')

// claim: the illegal state (error banner + results) is on screen
assert.equal(b.errorBanner && b.resultsList, true)
// and the four variables permit 16 combinations where only 4 states are real
assert.equal(2 ** 4, 16)

// ---------- AFTER: one variable, one truth ----------
let search = { status: 'idle' }

async function searchAfter(q) {
  search = { status: 'loading', query: q }
  const res = await fakeFetch(q)
  search = res.ok
    ? { status: 'success', query: q, results: await res.json() }
    : { status: 'error', query: q, message: 'Search failed' }
}

const showsAfter = () => ({
  spinner: search.status === 'loading',
  errorBanner: search.status === 'error',
  resultsList: search.status === 'success',
})

await searchAfter('boots')
await searchAfter('boot')
const a = showsAfter()
console.log('\nAFTER — same fail-then-success sequence:', a)

// claim: the illegal state cannot be represented — status is one word at a time,
// so at most one of the three UI states can ever be true
assert.equal(a.errorBanner && a.resultsList, false)
assert.equal([a.spinner, a.errorBanner, a.resultsList].filter(Boolean).length <= 1, true)
// no clearing patch exists in searchAfter; the banner is gone because there is no flag
assert.deepEqual(a, { spinner: false, errorBanner: false, resultsList: true })

console.log('\nclaims hold: the before reaches the illegal state; the after cannot write it.')
