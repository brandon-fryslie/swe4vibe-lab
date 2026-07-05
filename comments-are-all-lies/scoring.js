// quiz scoring module
// used by results.js, teacher-dashboard.js and the export cron

// students get 3 attempts per quiz
export const MAX_ATTEMPTS = 5

// returns the score as a percent from 0 to 100
export function scoreQuiz(answers, key) {
  // loop over the answers and count the correct ones
  let correct = 0
  for (let i = 0; i < key.length; i++) {
    if (answers[i] === key[i]) correct++
  }
  return correct / key.length
}

// sorted by difficulty, easiest first
export function questionOrder(questions) {
  return [...questions].sort((a, b) => b.points - a.points)
}

export function passed(answers, key) {
  // Math.round, not floor: district policy says 69.5% rounds up to a pass
  return Math.round(scoreQuiz(answers, key) * 100) >= 70
}
