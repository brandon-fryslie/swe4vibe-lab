// import students from the registrar's CSV export
export const sampleCsv = `S104,Nguyen,Lily,lnguyen@school.edu,3.8,B12
S117,Okafor,Sam,sokafor@school.edu,3.2,A03
S121,Reyes,Maya,mreyes@school.edu,3.9,B12
S130,Barnes,Theo,tbarnes@school.edu,2.8,C07`

export function parseLines(text) {
  return text.trim().split('\n').map(line => line.split(','))
}

export function emailList(rows) {
  return rows.map(r => r[3])
}

export function displayName(row) {
  return row[2] + ' ' + row[1]
}

export function honorRoll(rows) {
  return rows.filter(r => parseFloat(r[4]) >= 3.5).map(r => r[2] + ' ' + r[1])
}

export function roomRoster(rows, room) {
  return rows.filter(r => r[5] === room).map(r => r[2] + ' ' + r[1])
}

export function findStudent(rows, id) {
  return rows.find(r => r[0] === id)
}

export function mailMergeRow(row) {
  return { to: row[3], greeting: 'Dear ' + row[2] + ',', room: row[5] }
}
