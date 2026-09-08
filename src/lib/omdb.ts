const BASE_URL = 'https://www.omdbapi.com'

export async function omdbFetch<T>(params: Record<string, string>): Promise<T> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    return { Response: 'False', Error: 'No API key' } as T
  }
  try {
    const url = new URL(BASE_URL)
    url.searchParams.set('apikey', apiKey)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) return { Response: 'False', Error: `OMDb error: ${res.status}` } as T
    return res.json()
  } catch {
    return { Response: 'False', Error: 'Network error' } as T
  }
}

export function normalizePoster(poster: string): string | null {
  if (!poster || poster === 'N/A') return null
  return poster
}
