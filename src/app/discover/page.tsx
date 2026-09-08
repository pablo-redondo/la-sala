import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getMovieGenres, getTVGenres, discoverMovies, discoverTV, getPosterUrl } from '@/services/tmdb'
import DiscoverFilters from '@/components/DiscoverFilters'
import type { TmdbMovieResult } from '@/services/tmdb'

type SearchParams = {
  type?: string
  genre?: string
  sort?: string
  rating?: string
  year?: string
  page?: string
  genre_name?: string
}

function ResultCard({ item, type }: { item: TmdbMovieResult; type: 'movie' | 'tv' }) {
  const poster = getPosterUrl(item.poster_path, 'w342')
  const title = item.title ?? item.name ?? ''
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null

  return (
    <Link href={`/tmdb/${type}/${item.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 7 }} className="result-card">
      <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)' }} className="result-img">
        {poster && <Image src={poster} alt={title} fill sizes="(max-width: 640px) 45vw, 200px" style={{ objectFit: 'cover', transition: 'transform .4s ease' }} className="result-poster" />}
        {rating && (
          <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.88)', color: 'var(--gold)', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 999, backdropFilter: 'blur(6px)', border: '1px solid rgba(251,191,36,0.3)' }}>
            ★ {rating}
          </div>
        )}
        <div style={{ position: 'absolute', top: 7, left: 7, background: type === 'tv' ? 'rgba(34,211,238,0.9)' : 'rgba(244,114,182,0.9)', color: '#0a0812', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4, backdropFilter: 'blur(6px)' }}>
          {type === 'tv' ? 'SERIE' : 'PEL.'}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{year}</p>
      </div>
    </Link>
  )
}

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const type = (sp.type ?? 'movie') as 'movie' | 'tv'
  const sort = sp.sort ?? 'popularity.desc'
  const genre = sp.genre ?? ''
  const rating = sp.rating ?? ''
  const year = sp.year ?? ''
  const page = sp.page ?? '1'

  const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()])

  const params: Record<string, string> = { sort_by: sort, 'vote_count.gte': '30', page }
  if (genre) params.with_genres = genre
  if (rating) params['vote_average.gte'] = rating
  if (year) {
    const y = parseInt(year)
    if (y >= 2020) { params['primary_release_date.gte'] = `${y}-01-01`; params['primary_release_date.lte'] = `${y + 1}-12-31` }
    else if (y >= 2000) { params['primary_release_date.gte'] = `${y}-01-01`; params['primary_release_date.lte'] = `${y + 4}-12-31` }
    else if (y >= 1990) { params['primary_release_date.gte'] = '1990-01-01'; params['primary_release_date.lte'] = '1999-12-31' }
    else { params['primary_release_date.lte'] = '1989-12-31' }
  }

  const data = type === 'tv'
    ? await discoverTV(params as Parameters<typeof discoverTV>[0])
    : await discoverMovies(params as Parameters<typeof discoverMovies>[0])

  const results = data.results.filter(r => r.poster_path)
  const totalPages = Math.min(data.total_pages, 20)
  const currentPage = parseInt(page)

  const activeGenreName = genre
    ? (type === 'tv' ? tvGenres : movieGenres).find(g => String(g.id) === genre)?.name
    : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Compact header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Descubrir</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>
            {data.total_results.toLocaleString('es')} {type === 'tv' ? 'series' : 'películas'}{activeGenreName ? ` · ${activeGenreName}` : ''}
          </p>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: 20, paddingBottom: 48 }}>

        {/* Filters */}
        <div style={{ marginBottom: 28, padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <Suspense fallback={null}>
            <DiscoverFilters genres={movieGenres} tvGenres={tvGenres} />
          </Suspense>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-soft)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Sin resultados</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Prueba con otros filtros</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: 14 }}>
            {results.map(item => <ResultCard key={item.id} item={item} type={type} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40, flexWrap: 'wrap' }}>
            {currentPage > 1 && <PaginationLink sp={sp} page={currentPage - 1} label="←" />}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, currentPage - 2) + i
              if (p > totalPages) return null
              return <PaginationLink key={p} sp={sp} page={p} label={String(p)} active={p === currentPage} />
            })}
            {currentPage < totalPages && <PaginationLink sp={sp} page={currentPage + 1} label="→" />}
          </div>
        )}
      </div>

      <style>{`
        .result-card:hover .result-poster { transform: scale(1.08); }
        .result-img { box-shadow: 0 2px 12px rgba(0,0,0,0.4); transition: box-shadow .35s var(--ease-out), transform .35s var(--ease-out); }
        .result-card:hover .result-img { transform: translateY(-4px); box-shadow: 0 16px 36px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(139,92,246,0.3); }
      `}</style>
    </div>
  )
}

function PaginationLink({ sp, page, label, active }: { sp: SearchParams; page: number; label: string; active?: boolean }) {
  const params = new URLSearchParams()
  if (sp.type) params.set('type', sp.type)
  if (sp.genre) params.set('genre', sp.genre)
  if (sp.sort) params.set('sort', sp.sort)
  if (sp.rating) params.set('rating', sp.rating)
  if (sp.year) params.set('year', sp.year)
  params.set('page', String(page))

  return (
    <Link href={`/discover?${params.toString()}`} className={active ? 'btn-gradient' : 'btn-ghost'} style={{
      padding: '7px 14px', borderRadius: 'var(--radius)',
      background: active ? undefined : 'var(--surface2)',
      color: active ? undefined : 'var(--muted2)',
      fontSize: 13, fontWeight: active ? 800 : 500,
      textDecoration: 'none', border: active ? 'none' : '1px solid var(--border)',
      minWidth: 36, textAlign: 'center' as const,
    }}>{label}</Link>
  )
}
