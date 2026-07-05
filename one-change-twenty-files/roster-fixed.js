// Sample of the registrar's CSV export. This literal IS the outside data,
// so it necessarily embodies the outside shape; it is a fixture, not a knower.
export const sampleCsv = `S104,Nguyen,Lily,lnguyen@school.edu,3.8,B12
S117,Okafor,Sam,sokafor@school.edu,3.2,A03
S121,Reyes,Maya,mreyes@school.edu,3.9,B12
S130,Barnes,Theo,tbarnes@school.edu,2.8,C07`

// [LAW:one-source-of-truth] The single home for every fact about the
// registrar's row shape: column order and the GPA-as-decimal-string format.
// No other line in this module may index into a raw row.
function toStudent(row) {
  return {
    id: row[0],
    lastName: row[1],
    firstName: row[2],
    email: row[3],
    gpa: parseFloat(row[4]),
    room: row[5],
  }
}

// [LAW:one-source-of-truth] The single home for the file-level facts of the
// export: newline-separated records, comma-separated fields.
export function parseLines(text) {
  return text.trim().split('\n').map(line => line.split(','))
}

export function emailList(rows) {
  return rows.map(r => toStudent(r).email)
}

export function displayName(row) {
  const s = toStudent(row)
  return s.firstName + ' ' + s.lastName
}

export function honorRoll(rows) {
  return rows.filter(r => toStudent(r).gpa >= 3.5).map(r => displayName(r))
}

export function roomRoster(rows, room) {
  return rows.filter(r => toStudent(r).room === room).map(r => displayName(r))
}

export function findStudent(rows, id) {
  return rows.find(r => toStudent(r).id === id)
}

export function mailMergeRow(row) {
  const s = toStudent(row)
  return { to: s.email, greeting: 'Dear ' + s.firstName + ',', room: s.room }
}
