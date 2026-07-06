// The seam, written down: three promises the rest of the app relies on,
// as checks a machine can run against ANY version of priceOrder — the one
// you have, the one the diff proposes, the one next month's refactor
// proposes. This file is what reviewing the seam means. It never needs to
// see the bodies.
export const standardCart = () => [
  { sku: 'hoodie', price: 40, qty: 1 },
  { sku: 'tee', price: 12, qty: 2 },
]

export const SEAM_CHECKS = [
  {
    name: 'the happy path: standard cart with HALFOFF totals $32',
    run: (priceOrder) => priceOrder(standardCart(), 'HALFOFF').total === 32,
  },
  {
    name: 'the same question gets the same answer, every time',
    run: (priceOrder) => {
      const items = standardCart()
      const first = priceOrder(items, 'HALFOFF').total
      const second = priceOrder(items, 'HALFOFF').total
      return first === second
    },
  },
  {
    name: 'your items come back exactly as you handed them over',
    run: (priceOrder) => {
      const items = standardCart()
      const before = JSON.stringify(items)
      priceOrder(items, 'HALFOFF')
      return JSON.stringify(items) === before
    },
  },
]

export const reviewSeams = (priceOrder) =>
  SEAM_CHECKS.map((check) => ({ name: check.name, pass: check.run(priceOrder) }))
