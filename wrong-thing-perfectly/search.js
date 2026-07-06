// The request, verbatim: "add search to the customer list."
// This is that request, built perfectly. It searches. The customer list.
// Every word honored; every gap in the words filled with a plausible guess:
// search WHAT? (the name — most lists search names) matching HOW? (exact
// substring — the ordinary reading). Nobody chose those answers. They're
// what "search" statistically means when you don't say more.
export function searchCustomers(customers, query) {
  return customers.filter((c) => c.name.includes(query))
}
