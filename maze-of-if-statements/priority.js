// support ticket triage

function supportPriority(ticket) {
  if (ticket.plan === 'enterprise') {
    if (ticket.subject.toLowerCase().includes('outage')) {
      return 'p0'
    }
    return 'p1'
  }
  if (ticket.ageDays > 7) {
    return 'p1'
  }
  if (ticket.plan === 'pro') {
    if (ticket.ageDays > 3) {
      return 'p1'
    }
    return 'p2'
  }
  if (ticket.subject.toLowerCase().includes('outage')) {
    return 'p1'
  }
  if (ticket.plan === 'pro' && ticket.ageDays > 5) {
    return 'p1'
  }
  return 'p3'
}
