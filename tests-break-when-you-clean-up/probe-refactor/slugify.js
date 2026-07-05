// behavior-preserving cleanup: one chain, no internals object
export function slugify(title) {
  return title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}
