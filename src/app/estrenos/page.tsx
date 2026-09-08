export const revalidate = 3600

import { getNowPlaying, getUpcomingMovies, getPosterUrl, getBackdropUrl } from '@/services/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import type { TmdbMovieResult } from '@/services/tmdb'

function NowCard({ movie }: { movie: TmdbMovieResult }) {
  const poster = getPosterUrl(movie.poster_path, 'w342')
  const title = movie.title ?? movie.name ?? ''
  const year = (movie.release_date ?? '').slice(0, 4)
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null

  return (
    <Link href={`/tmdb/movie/${movie.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 7 }} className="card-hover">
      <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)' }} className="card-img">
        {poster && <Image src={poster} alt={title} fill sizes="(max-width: 640px) 45vw, 180px" style={{ objectFit: 'cover', transition: 'transform .4s ease' }} className="card-poster" />}
        {rating && (
          <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.88)', color: 'var(--gold)', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 999, backdropFilter: 'blur(6px)' }}>
            ★ {rating}
          </div>
        )}
        <div style={{ position: 'absolute', top: 7, left: 7, background: 'rgba(244,114,182,0.9)', color: '#0a0812', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>EN CINES</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{year}</p>
      </div>
    </Link>
  )
}

function UpcomingRow({ movie }: { movie: TmdbMovieResult }) {
  const poster = getPosterUrl(movie.poster_path, 'w185')
  const backdrop = getBackdropUrl(movie.backdrop_path, 'w780')
  const title = movie.title ?? movie.name ?? ''
  const date = movie.release_date ?? ''
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null

  return (
    <Link href={`/tmdb/movie/${movie.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--border)' }} className="upcoming-row">
      <div style={{ flexShrink: 0, width: 52, height: 78, borderRadius: 6, overflow: 'hidden', background: 'var(--surface2)', position: 'relative' }}>
        {poster
          ? <Image src={poster} alt={title} fill sizes="52px" style={{ objectFit: 'cover' }} />
          : backdrop
            ? <Image src={backdrop} alt={title} fill sizes="52px" style={{ objectFit: 'cover' }} />
            : null
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>{title}</p>
        {date && (
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>
            {new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
        {movie.overview && (
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: 0.7 }}>{movie.overview}</p>
        )}
      </div>
      {rating && (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold)' }}>★ {rating}</p>
          <p style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2, fontWeight: 600 }}>TMDB</p>
        </div>
      )}
    </Link>
  )
}

export default async function EstrenosPage() {
  const [nowPlaying, upcoming] = await Promise.all([getNowPlaying(), getUpcomingMovies()])

  const nowFiltered = nowPlaying.filter(m => m.poster_path)
  const today = new Date().toISOString().slice(0, 10)
  const upcomingSorted = upcoming
    .filter(m => m.poster_path && (m.release_date ?? '') >= today)
    .sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))

  // Group by month
  const grouped: Record<string, TmdbMovieResult[]> = {}
  upcomingSorted.slice(0, 30).forEach(m => {
    const key = m.release_date?.slice(0, 7) ?? 'sin-fecha'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Compact header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Cartelera & Estrenos</h1>
              <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>Lo que está en cines y lo que viene</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="#en-cines" className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>En cines</Link>
              <Link href="#proximos" className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>Próximos</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: 24, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* En cines */}
        {nowFiltered.length > 0 && (
          <section id="en-cines">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 16, background: 'var(--gradient)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>En cines ahora</h2>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{nowFiltered.length} películas</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
              {nowFiltered.slice(0, 20).map(m => <NowCard key={m.id} movie={m} />)}
            </div>
          </section>
        )}

        {/* Próximos estrenos por mes */}
        {Object.keys(grouped).length > 0 && (
          <section id="proximos">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 3, height: 16, background: 'var(--gradient)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Próximos estrenos</h2>
            </div>
            {Object.entries(grouped).map(([monthKey, movies]) => {
              const label = monthKey === 'sin-fecha' ? 'Sin fecha'
                : new Date(monthKey + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())
              return (
                <div key={monthKey} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {movies.map(m => <UpcomingRow key={m.id} movie={m} />)}
                  </div>
                </div>
              )
            })}
          </section>
        )}
      </div>

      <style>{`
        .card-hover:hover .card-poster { transform: scale(1.08); }
        .card-img { box-shadow: 0 2px 12px rgba(0,0,0,0.4); transition: box-shadow .35s var(--ease-out), transform .35s var(--ease-out); }
        .card-hover:hover .card-img { transform: translateY(-4px); box-shadow: 0 16px 36px -8px rgba(0,0,0,0.75), 0 0 0 1px rgba(139,92,246,0.3); }
        .upcoming-row { transition: background .2s var(--ease-out); border-radius: var(--radius); padding-left: 8px; padding-right: 8px; margin: 0 -8px; }
        .upcoming-row:hover { background: var(--surface2); }
        .pill-link:hover { background: rgba(139,92,246,0.2) !important; border-color: rgba(139,92,246,0.4) !important; color: var(--text) !important; }
      `}</style>
    </div>
  )
}
