// The lesson's claim, executed:
//   before — five surfaces each read the API's raw shape directly
//     (m.attributes.poster_url). The API renames poster_url -> posterUrl; the
//     rename hunt fixes the four obvious sites and misses the fifth, which
//     ships 'undefined' to a user — silent, no crash.
//   after — one adapter owns the outside shape: the same rename is one edit,
//     and no surface can even spell the raw field name.
//   module — roster.js knows the registrar CSV's column order in 13 places
//     across 6 functions; roster-fixed.js confines all of it to one translator
//     (toStudent) with behavior identical to golden.json.
// Exit 0 iff every claim holds when actually run.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as before from './roster.js'
import * as fixed from './roster-fixed.js'

const here = dirname(fileURLToPath(import.meta.url))

// ---------- BEFORE (lesson movie app): five surfaces know the raw shape ----------
const v1 = [{ attributes: { title: 'Blue Doors', poster_url: 'cdn/blue.jpg', year: 2024, rating_avg: 8.1 } }]
const v2 = [{ attributes: { title: 'Blue Doors', posterUrl: 'cdn/blue.jpg', year: 2024, rating_avg: 8.1 } }]

const surfaces = {
  searchRow:    m => m.attributes.title + ' (' + m.attributes.year + ') img=' + m.attributes.poster_url,
  detailHeader: m => m.attributes.title + ' — ' + m.attributes.rating_avg + '/10 img=' + m.attributes.poster_url,
  favoriteCard: m => '♥ ' + m.attributes.title + ' img=' + m.attributes.poster_url,
  watchLater:   m => '⏱ ' + m.attributes.title + ' img=' + m.attributes.poster_url,
  shareText:    m => 'Watch "' + m.attributes.title + '"! ' + m.attributes.poster_url,
}

console.log('BEFORE on v1 — all five surfaces fine:')
for (const [k, f] of Object.entries(surfaces)) console.log('  ' + k + ': ' + f(v1[0]))
assert.ok(!Object.values(surfaces).some(f => f(v1[0]).includes('undefined')))

// the hunt: four sites get the rename, shareText is missed
const hunted = {
  searchRow:    m => m.attributes.title + ' (' + m.attributes.year + ') img=' + m.attributes.posterUrl,
  detailHeader: m => m.attributes.title + ' — ' + m.attributes.rating_avg + '/10 img=' + m.attributes.posterUrl,
  favoriteCard: m => '♥ ' + m.attributes.title + ' img=' + m.attributes.posterUrl,
  watchLater:   m => '⏱ ' + m.attributes.title + ' img=' + m.attributes.posterUrl,
  shareText:    m => 'Watch "' + m.attributes.title + '"! ' + m.attributes.poster_url,  // missed
}
console.log('\nAPI v2 lands; the rename hunt fixes 4 of 5 sites:')
for (const [k, f] of Object.entries(hunted)) console.log('  ' + k + ': ' + f(v2[0]))
// the silent miss, asserted: four right, the fifth ships 'undefined', nothing crashed
const huntedOut = Object.fromEntries(Object.entries(hunted).map(([k, f]) => [k, f(v2[0])]))
assert.ok(!huntedOut.searchRow.includes('undefined'))
assert.ok(!huntedOut.detailHeader.includes('undefined'))
assert.ok(!huntedOut.favoriteCard.includes('undefined'))
assert.ok(!huntedOut.watchLater.includes('undefined'))
assert.ok(huntedOut.shareText.includes('undefined'))

// ---------- AFTER: one adapter owns the outside shape ----------
function parseMovie(raw) {          // the ONLY line in the app that knows v2
  const a = raw.attributes
  return { title: a.title, poster: a.posterUrl, year: a.year, rating: a.rating_avg }
}

const after = {
  searchRow:    m => m.title + ' (' + m.year + ') img=' + m.poster,
  detailHeader: m => m.title + ' — ' + m.rating + '/10 img=' + m.poster,
  favoriteCard: m => '♥ ' + m.title + ' img=' + m.poster,
  watchLater:   m => '⏱ ' + m.title + ' img=' + m.poster,
  shareText:    m => 'Watch "' + m.title + '"! ' + m.poster,
}

console.log('\nAFTER on v2 — adapter translated once, five surfaces read OUR shape:')
const movie = parseMovie(v2[0])
for (const [k, f] of Object.entries(after)) console.log('  ' + k + ': ' + f(movie))
assert.ok(!Object.values(after).some(f => f(movie).includes('undefined')))
console.log('places that knew the outside field name: before 5, after 1 (parseMovie)')

// ---------- the module: roster.js vs roster-fixed.js ----------
// behavior identical, proven against the golden probe set
const golden = JSON.parse(readFileSync(join(here, 'golden.json'), 'utf8'))
const probe = (m) => {
  const rows = m.parseLines(m.sampleCsv)
  return {
    emails: m.emailList(rows),
    name0: m.displayName(rows[0]),
    honor: m.honorRoll(rows),
    b12: m.roomRoster(rows, 'B12'),
    find: m.findStudent(rows, 'S121'),
    merge: m.mailMergeRow(rows[3]),
  }
}
assert.deepEqual(probe(before), golden)
assert.deepEqual(probe(fixed), golden)
console.log('\nexample: roster.js and roster-fixed.js both match golden.json exactly')

// the census, executed: how many places spell a raw column index?
const countSites = (file) => (readFileSync(join(here, file), 'utf8').match(/\br(?:ow)?\[\d\]/g) || []).length
assert.equal(countSites('roster.js'), 13)
assert.equal(countSites('roster-fixed.js'), 6)
// …and in the fixed file, every one of them lives inside the translator
const fixedSrc = readFileSync(join(here, 'roster-fixed.js'), 'utf8')
const toStudentBody = fixedSrc.slice(fixedSrc.indexOf('function toStudent'), fixedSrc.indexOf('export function parseLines'))
assert.equal((toStudentBody.match(/\brow\[\d\]/g) || []).length, 6)
console.log('column-order knowledge sites: before 13 (spread over 6 functions), after 6 (all inside toStudent)')
console.log('the registrar shuffles a column: before = hunt 6 functions and miss one silently; after = edit toStudent, done')

console.log('\nclaims hold: twenty files needed editing because twenty files knew a fact one file should own.')
