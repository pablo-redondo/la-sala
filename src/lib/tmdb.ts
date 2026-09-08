export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${size}${path}`
}

async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
  const url = new URL(`${baseUrl}${endpoint}`)
  url.searchParams.set('api_key', process.env.TMDB_API_KEY!)
  url.searchParams.set('language', 'es-ES')
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export default tmdbFetch
