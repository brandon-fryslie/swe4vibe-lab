// support ticket triage
//
// [LAW:dataflow-not-control-flow] The rules are data; the evaluator runs the
// same steps on every call and variability lives entirely in the rule values.
// Rules are ordered, first match wins — the order IS the precedence, stated
// once, instead of being implied by nested branch structure.
//
// Every rule has the same shape; `null` means "this criterion doesn't apply".
// [LAW:one-type-per-behavior] one rule type, seven instances.
//
// [LAW:comments-explain-why-only] exception, behavioral note worth keeping:
// the pro rules outrank the general outage rule, so a pro outage ticket aged
// <= 3 days resolves to p2, not p1 — faithful to the original's branch order.
const RULES = [
  { plan: 'enterprise', ageOver: null, subjectHas: 'outage', result: 'p0' },
  { plan: 'enterprise', ageOver: null, subjectHas: null,     result: 'p1' },
  { plan: null,         ageOver: 7,    subjectHas: null,     result: 'p1' },
  { plan: 'pro',        ageOver: 3,    subjectHas: null,     result: 'p1' },
  { plan: 'pro',        ageOver: null, subjectHas: null,     result: 'p2' },
  { plan: null,         ageOver: null, subjectHas: 'outage', result: 'p1' },
  { plan: null,         ageOver: null, subjectHas: null,     result: 'p3' },
]

// The original's `plan === 'pro' && ageDays > 5` branch is NOT carried over:
// it was unreachable (the pro rules above always match first), so dropping it
// preserves behavior exactly.

function ruleMatches(rule, ticket) {
  const planOk = rule.plan === null || ticket.plan === rule.plan
  const ageOk = rule.ageOver === null || ticket.ageDays > rule.ageOver
  const subjectOk =
    rule.subjectHas === null ||
    ticket.subject.toLowerCase().includes(rule.subjectHas)
  return planOk && ageOk && subjectOk
}

function supportPriority(ticket) {
  // The final rule matches everything, so a match always exists.
  return RULES.find((rule) => ruleMatches(rule, ticket)).result
}
