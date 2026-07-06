// The same feature, built against the spec in done-checks.mjs instead of
// against the sentence. Nothing here is cleverer than search.js — it's the
// same five lines of work. The difference is that the gaps in the request
// were filled by the requester, in writing, before the build.
export function searchCustomers(customers, query) {
  const q = query.trim().toLowerCase()
  return customers.filter(
    (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  )
}
