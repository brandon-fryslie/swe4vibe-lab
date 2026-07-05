// real bug: lowercasing dropped — structure faithfully preserved
export const internals = {
  stripPunctuation(s) { return s.replace(/[^\w\s-]/g, '') },
  collapseWhitespace(s) { return s.trim().replace(/\s+/g, '-') },
  dedupeDashes(s) { return s.replace(/-+/g, '-') },
}
export function slugify(title) {
  const clean = internals.stripPunctuation(title)
  return internals.dedupeDashes(internals.collapseWhitespace(clean))
}
