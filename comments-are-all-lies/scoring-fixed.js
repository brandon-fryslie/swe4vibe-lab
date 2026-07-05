export const MAX_ATTEMPTS = 5

export function scoreQuiz(answers, key) {
  let correct = 0
  for (let i = 0; i < key.length; i++) {
    if (answers[i] === key[i]) correct++
  }
  return correct / key.length
}

export function questionOrder(questions) {
  return [...questions].sort((a, b) => b.points - a.points)
}

const PASSING_PERCENT = 70

export function passed(answers, key) {
  // [LAW:comments-explain-why-only] Math.round, not floor: district policy says 69.5% rounds up to a pass
  return Math.round(scoreQuiz(answers, key) * 100) >= PASSING_PERCENT
}
