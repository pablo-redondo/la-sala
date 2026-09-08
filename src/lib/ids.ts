const IMDB_ID_RE = /^tt\d{5,10}$/
const TMDB_ID_RE = /^\d{1,10}$/

export function isImdbId(id: string): boolean {
  return IMDB_ID_RE.test(id)
}

export function isTmdbId(id: string): boolean {
  return TMDB_ID_RE.test(id)
}
