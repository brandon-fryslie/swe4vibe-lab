// monthly budget tracker

const BUDGET_LIMIT = 2000
const FOOD_BUDGET = 600

let expenses = []

// ---------------------------------------------------------------------------
// Pure core — take inputs, return results; no DOM, no network, no globals.
// [LAW:effects-at-boundaries] each function below only computes.
// ---------------------------------------------------------------------------

function withExpense(expenses, expense) {
  return [...expenses, expense]
}

function withRefund(expenses, desc, amount) {
  return expenses.map((e) =>
    e.desc === desc ? { ...e, amount: e.amount - amount } : e
  )
}

function totalOf(expenses) {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

function isOverBudget(total) {
  return total > BUDGET_LIMIT
}

function categoryTotals(expenses) {
  const byCat = {}
  for (const e of expenses) byCat[e.category] = (byCat[e.category] || 0) + e.amount
  return byCat
}

function foodBarPercent(expenses) {
  const foodTotal = categoryTotals(expenses).food || 0
  return Math.min(100, (foodTotal / FOOD_BUDGET) * 100)
}

function formatMoney(amount) {
  return '$' + amount.toFixed(2)
}

function reportHtml(byCat) {
  let html = '<ul>'
  for (const cat in byCat) {
    html += '<li>' + cat + ': ' + formatMoney(byCat[cat]) + '</li>'
  }
  return html + '</ul>'
}

// ---------------------------------------------------------------------------
// Effect edges — thin shells that call the pure core and act on its results.
// [LAW:effects-at-boundaries] all DOM and network contact lives here.
// ---------------------------------------------------------------------------

function renderSummary(expenses) {
  const total = totalOf(expenses)
  totalEl.textContent = formatMoney(total)
  if (isOverBudget(total)) {
    warningEl.textContent = 'Over budget!'
    warningEl.style.display = 'block'
  } else {
    warningEl.style.display = 'none'
  }
  foodBarEl.style.width = foodBarPercent(expenses) + '%'
}

async function addExpense(desc, amount, category) {
  expenses = withExpense(expenses, {
    desc,
    amount,
    category,
    date: new Date().toISOString(),
  })
  renderSummary(expenses)
  await fetch('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({ desc, amount, category }),
  })
}

async function applyRefund(desc, amount) {
  expenses = withRefund(expenses, desc, amount)
  renderSummary(expenses)
  const refunded = expenses.find((e) => e.desc === desc)
  await fetch('/api/expenses/' + encodeURIComponent(desc), {
    method: 'PATCH',
    body: JSON.stringify({ amount: refunded.amount }),
  })
}

async function monthlyReport() {
  const byCat = categoryTotals(expenses)
  reportEl.innerHTML = reportHtml(byCat)
  await fetch('/api/report', { method: 'POST', body: JSON.stringify(byCat) })
}
