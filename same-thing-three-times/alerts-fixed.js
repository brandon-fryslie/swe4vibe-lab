// alert formatting for the ops dashboard

// [LAW:one-type-per-behavior] the three builders shared one behavior; only these
// values differed, so they are instances of one channel type, not three functions.
// Note: maxLength bounds the prefixed message only — the suffix is appended after
// truncation, matching the original behavior exactly.
const CHANNELS = {
  email: { prefix: 'ALERT — ',                 maxLength: 500, suffix: '\n-- opsbot' },
  sms:   { prefix: 'ALERT — ',                 maxLength: 160, suffix: '' },
  slack: { prefix: ':rotating_light: ALERT — ', maxLength: 400, suffix: '\n_-- opsbot_' },
}

function buildAlert(channel, service, message) {
  const { prefix, maxLength, suffix } = CHANNELS[channel]
  let body = prefix + service.toUpperCase() + ': ' + message
  if (body.length > maxLength) body = body.slice(0, maxLength - 3) + '...'
  return body + suffix
}

function buildEmailAlert(service, message) { return buildAlert('email', service, message) }
function buildSmsAlert(service, message)   { return buildAlert('sms', service, message) }
function buildSlackAlert(service, message) { return buildAlert('slack', service, message) }
