export const plants = [
  { name: 'Monstera', spot: 'living room', wateredDaysAgo: 30, succulent: false },
  { name: 'Aloe',     spot: 'kitchen',     wateredDaysAgo: 96, succulent: true },
  { name: 'Basil',    spot: 'patio',       wateredDaysAgo: 8,  succulent: false },
  { name: 'Fern',     spot: 'bathroom',    wateredDaysAgo: 51, succulent: false },
]

export const wateringLog = [
  { plant: 'Monstera', ml: 250 },
  { plant: 'Fern',     ml: 150 },
  { plant: 'Aloe',     ml: 60 },
  { plant: 'Monstera', ml: 250 },
  { plant: 'Basil',    ml: 120 },
]

// [LAW:one-source-of-truth] derived from the log, never stored separately
export const logStats = { totalWaterings: wateringLog.length }

export function allPlants(list) {
  return list
}

export function plantsByName(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name))
}

export function needsWater(plant) {
  return plant.wateredDaysAgo >= 3
}

export function wateredLabel(plant) {
  return Math.round(plant.wateredDaysAgo / 24) + ' days ago'
}

// succulents rot on a full pour
export function pourFor(plant, usualMl) {
  return plant.succulent ? usualMl * 0.5 : usualMl
}

export function plantCount(list) {
  return list.length
}
