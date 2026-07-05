// weather dashboard

// The /api/weather endpoint returns JSON shaped like sample-response.json
// (in this directory).

let forecast = null
let location = null

function loadWeather(apiResponse) {
  forecast = apiResponse.forecasts
  location = apiResponse.location
}

function renderToday() {
  if (!forecast) return
  const today = forecast[0]
  document.getElementById('today-temp').textContent = today.high + '° / ' + today.low + '°'
  document.getElementById('today-cond').textContent = today.conditions
}

function renderWeek() {
  if (!forecast) return
  const rows = forecast.map((day) => '<li>' + day.day + ': ' + day.high + '°</li>')
  document.getElementById('week-list').innerHTML = '<ul>' + rows.join('') + '</ul>'
}

function renderHeader() {
  if (!location) return
  document.getElementById('city-name').textContent = location.city
}

function renderAlertBanner(apiResponse) {
  if (apiResponse.alert) {
    document.getElementById('alert-banner').textContent = apiResponse.alert.headline
  }
}
