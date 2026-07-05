// alert formatting for the ops dashboard

function buildEmailAlert(service, message) {
  let body = 'ALERT — ' + service.toUpperCase() + ': ' + message
  if (body.length > 500) body = body.slice(0, 497) + '...'
  return body + '\n-- opsbot'
}

function buildSmsAlert(service, message) {
  let body = 'ALERT — ' + service.toUpperCase() + ': ' + message
  if (body.length > 160) body = body.slice(0, 157) + '...'
  return body
}

function buildSlackAlert(service, message) {
  let body = ':rotating_light: ALERT — ' + service.toUpperCase() + ': ' + message
  if (body.length > 400) body = body.slice(0, 397) + '...'
  return body + '\n_-- opsbot_'
}
