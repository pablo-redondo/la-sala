'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { TmdbGenre } from '@/services/tmdb'

type Props = {
  genres: TmdbGenre[]
  tvGenres: TmdbGenre[]
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Más populares' },
  { value: 'vote_average.desc', label: 'Mejor valoradas' },
  { value: 'primary_release_date.desc', label: 'Más recientes' },
  { value: 'revenue.desc', label: 'Mayor recaudación' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Cualquier nota' },
  { value: '6', label: '6+ buena' },
  { value: '7', label: '7+ muy buena' },
  { value: '8', label: '8+ excelente' },
  { value: '9', label: '9+ obra maestra' },
]

const YEAR_OPTIONS = [
  { value: '', label: 'Cualquier año' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2020', label: '2020–2021' },
  { value: '2015', label: '2015–2019' },
  { value: '2010', label: '2010–2014' },
  { value: '2000', label: '2000–2009' },
  { value: '1990', label: '1990–1999' },
  { value: '1980', label: 'Antes de 1990' },
]

export default function DiscoverFilters({ genres, tvGenres }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const type = sp.get('type') ?? 'movie'
  const genre = sp.get('genre') ?? ''
  const sort = sp.get('sort') ?? 'popularity.desc'
  const rating = sp.get('rating') ?? ''
  const year = sp.get('year') ?? ''

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/discover?${params.toString()}`)
  }, [router, sp])

  const activeGenres = type === 'tv' ? tvGenres : genres

  const chip = (active: boolean) => ({
    fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 999, cursor: 'pointer' as const,
    border: `1px solid ${active ? 'rgba(139,92,246,0.5)' : 'var(--border)'}`,
    background: active ? 'rgba(139,92,246,0.15)' : 'var(--surface2)',
    color: active ? 'var(--text)' : 'var(--muted)',
    boxShadow: active ? '0 0 0 1px rgba(139,92,246,0.15), 0 4px 16px -4px rgba(139,92,246,0.4)' : 'none',
    transition: 'all .2s var(--ease-out)',
    flexShrink: 0 as const,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Type toggle */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--surface2)', borderRadius: 10, padding: 3, width: 'fit-content', border: '1px solid var(--border)' }}>
        {(['movie', 'tv'] as const).map(t => (
          <button key={t} onClick={() => update('type', t)} style={{
            background: type === t ? 'var(--surface)' : 'transparent',
            border: type === t ? '1px solid var(--border)' : '1px solid transparent',
            color: type === t ? 'var(--text)' : 'var(--muted)',
            fontSize: 13, fontWeight: type === t ? 700 : 500,
            padding: '7px 20px', borderRadius: 8, cursor: 'pointer',
            transition: 'all .15s',
          }}>
            {t === 'movie' ? 'Películas' : 'Series'}
          </button>
        ))}
      </div>

      {/* Genres */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Género</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => update('genre', '')} style={chip(!genre)}>Todos</button>
          {activeGenres.map(g => (
            <button key={g.id} onClick={() => update('genre', String(g.id))} style={chip(genre === String(g.id))}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Sort */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Ordenar por</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => update('sort', o.value)} style={chip(sort === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Nota mínima</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RATING_OPTIONS.map(o => (
              <button key={o.value} onClick={() => update('rating', o.value)} style={chip(rating === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Año</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {YEAR_OPTIONS.map(o => (
              <button key={o.value} onClick={() => update('year', o.value)} style={chip(year === o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
