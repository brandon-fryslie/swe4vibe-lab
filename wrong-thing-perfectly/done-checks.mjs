// The spec: what "add search to the customer list" actually MEANT, written
// as checks a machine can run — before the build, so the build has a target
// instead of a guess. Each check is one gap in the original sentence that
// the words left open.
export const CUSTOMERS = [
  { id: 'c1', name: 'Ana Flores', email: 'ana@flores.dev' },
  { id: 'c2', name: 'Kai Smith', email: 'kai@example.com' },
  { id: 'c3', name: 'Otto Marsh', email: 'otto.marsh@example.com' },
]

const ids = (result) => result.map((c) => c.id)

export const DONE = [
  {
    name: 'finds a name typed in the exact casing',
    run: (search) => ids(search(CUSTOMERS, 'Ana')),
    expect: ['c1'],
  },
  {
    name: 'finds a name typed lowercase, the way people type',
    run: (search) => ids(search(CUSTOMERS, 'smith')),
    expect: ['c2'],
  },
  {
    name: 'finds a customer by their email',
    run: (search) => ids(search(CUSTOMERS, 'otto.marsh@')),
    expect: ['c3'],
  },
  {
    name: 'survives a stray space from a paste',
    run: (search) => ids(search(CUSTOMERS, ' Kai ')),
    expect: ['c2'],
  },
]

export const runChecks = (search) =>
  DONE.map((check) => {
    const got = check.run(search)
    return {
      name: check.name,
      pass: JSON.stringify(got) === JSON.stringify(check.expect),
      got,
      expect: check.expect,
    }
  })
