// blog engine — turns post titles into URL slugs
// steps exported via `internals` so the tests can spy on them

export const internals = {
  stripPunctuation(s) { return s.replace(/[^\w\s-]/g, '') },
  collapseWhitespace(s) { return s.trim().replace(/\s+/g, '-') },
  dedupeDashes(s) { return s.replace(/-+/g, '-') },
}

export function slugify(title) {
  const clean = internals.stripPunctuation(title.toLowerCase())
  return internals.dedupeDashes(internals.collapseWhitespace(clean))
}
