// monthly budget tracker

let expenses = []

async function addExpense(desc, amount, category) {
  expenses.push({ desc, amount, category, date: new Date().toISOString() })
  let total = 0
  for (const e of expenses) total += e.amount
  totalEl.textContent = '$' + total.toFixed(2)
  if (total > 2000) {
    warningEl.textContent = 'Over budget!'
    warningEl.style.display = 'block'
  }
  let foodTotal = 0
  for (const e of expenses) if (e.category === 'food') foodTotal += e.amount
  foodBarEl.style.width = Math.min(100, (foodTotal / 600) * 100) + '%'
  await fetch('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({ desc, amount, category }),
  })
}

async function applyRefund(desc, amount) {
  const idx = expenses.findIndex((e) => e.desc === desc)
  expenses[idx].amount -= amount
  let total = 0
  for (const e of expenses) total += e.amount
  totalEl.textContent = '$' + total.toFixed(2)
  if (total <= 2000) warningEl.style.display = 'none'
  await fetch('/api/expenses/' + encodeURIComponent(desc), {
    method: 'PATCH',
    body: JSON.stringify({ amount: expenses[idx].amount }),
  })
}

function monthlyReport() {
  let html = '<ul>'
  const byCat = {}
  for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + e.amount
  for (const cat in byCat) {
    html += '<li>' + cat + ': $' + byCat[cat].toFixed(2) + '</li>'
  }
  html += '</ul>'
  reportEl.innerHTML = html
  fetch('/api/report', { method: 'POST', body: JSON.stringify(byCat) })
}
