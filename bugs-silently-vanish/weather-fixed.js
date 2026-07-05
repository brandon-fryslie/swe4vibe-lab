// weather dashboard

// The /api/weather endpoint returns JSON shaped like sample-response.json
// (in this directory).

// [LAW:no-shared-mutable-globals] [LAW:no-ambient-temporal-coupling] the old
// module-level `forecast`/`location` nulls existed only because loading and
// rendering were decoupled in time; loadWeather is now the single owner of
// ordering, so render functions receive data that already exists and never
// need to guard against "not loaded yet".
function loadWeather(apiResponse) {
  // [LAW:one-source-of-truth] the API field is `forecast` (see
  // sample-response.json), not `forecasts` — the old code read a field that
  // never existed, so every render bailed silently on every call.
  renderToday(apiResponse.forecast[0])
  renderWeek(apiResponse.forecast)
  renderHeader(apiResponse.location)
  renderAlertBanner(apiResponse.alert)
}

function renderToday(today) {
  document.getElementById('today-temp').textContent = today.high + '° / ' + today.low + '°'
  document.getElementById('today-cond').textContent = today.conditions
}

function renderWeek(forecast) {
  const rows = forecast.map((day) => '<li>' + day.day + ': ' + day.high + '°</li>')
  document.getElementById('week-list').innerHTML = '<ul>' + rows.join('') + '</ul>'
}

function renderHeader(location) {
  document.getElementById('city-name').textContent = location.city
}

// [LAW:no-defensive-null-guards] exception: `alert` is genuine optionality —
// the endpoint omits it when no alert is active — so absence is a real state
// the user must see handled, not a crash to guard against. Both branches
// render: the else clears a stale banner left over from a previous alert.
function renderAlertBanner(alert) {
  const banner = document.getElementById('alert-banner')
  if (alert) {
    banner.textContent = alert.headline
    banner.hidden = false
  } else {
    banner.textContent = ''
    banner.hidden = true
  }
}
