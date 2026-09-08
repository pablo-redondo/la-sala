export const revalidate = 3600

import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getMovieDetail } from '@/services/movies'
import { normalizePoster } from '@/lib/omdb'
import { getMovieEnhancement } from '@/services/tmdb'
import { isImdbId } from '@/lib/ids'
import WatchlistButton from '@/components/WatchlistButton'
import CastSection from '@/components/CastSection'
import TmdbCarousel from '@/components/TmdbCarousel'
import WatchProvidersSection from '@/components/WatchProvidersSection'
import TrailerButton from '@/components/TrailerButton'

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isImdbId(id)) notFound()

  const [movie, tmdb] = await Promise.all([
    getMovieDetail(id),
    getMovieEnhancement(id),
  ])
  // If OMDb doesn't have the movie but TMDB does, redirect to the TMDB-native page
  if (!movie) {
    if (tmdb?.tmdbId) redirect(`/tmdb/movie/${tmdb.tmdbId}`)
    notFound()
  }

  const poster = normalizePoster(movie.Poster)
  const backdropUrl = tmdb?.backdropUrl ?? null
  const genres = movie.Genre !== 'N/A' ? movie.Genre.split(', ') : []
  const ratingNum = parseFloat(movie.imdbRating)
  const ratingPercent = movie.imdbRating !== 'N/A' ? (ratingNum / 10) * 100 : null

  const recs = tmdb?.recommendations?.length ? tmdb.recommendations : tmdb?.similar ?? []

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Cinematic backdrop */}
      <div style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
        {(backdropUrl || poster) && (
          <Image
            src={backdropUrl ?? poster!}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              transform: backdropUrl ? 'scale(1.02)' : 'scale(1.1)',
              filter: backdropUrl ? 'brightness(0.55)' : 'blur(60px)',
              opacity: backdropUrl ? 1 : 0.3,
            }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,7,13,0.1) 0%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, rgba(8,7,13,0.2) 55%, transparent 100%)' }} />
      </div>

      <div className="page-inner" style={{ marginTop: -440, position: 'relative', zIndex: 10 }}>

        <Link href="/movies" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
          textDecoration: 'none', marginBottom: 28,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
          padding: '6px 14px', borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          ← Películas
        </Link>

        <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Poster */}
          {poster && (
            <div style={{
              flexShrink: 0,
              width: 'clamp(150px, 16vw, 240px)',
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 40px 100px -10px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
            }}>
              <Image src={poster} alt={movie.Title} width={240} height={360} style={{ width: '100%', display: 'block' }} priority />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14, paddingTop: poster ? 8 : 0 }}>

            {genres.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {genres.map(g => (
                  <Link key={g} href={`/discover?genre_name=${encodeURIComponent(g)}&type=movie`} style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600,
                    padding: '4px 12px', borderRadius: 999, textDecoration: 'none',
                    backdropFilter: 'blur(8px)',
                  }}>{g}</Link>
                ))}
              </div>
            )}

            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 54px)',
              fontWeight: 900, color: '#fff',
              letterSpacing: '-1.5px', lineHeight: 0.95,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}>
              {movie.Title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {movie.imdbRating !== 'N/A' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 20 }}>★</span>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 24 }}>{movie.imdbRating}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>/10 IMDb</span>
                  </div>
                  {ratingPercent !== null && (
                    <div style={{ width: 52, height: 4, background: 'rgba(251,191,36,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${ratingPercent}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              )}
              {movie.Metascore && movie.Metascore !== 'N/A' && (
                <div style={{
                  background: parseInt(movie.Metascore) >= 61 ? '#166534' : parseInt(movie.Metascore) >= 40 ? '#854d0e' : '#7f1d1d',
                  color: '#fff', fontWeight: 900, fontSize: 12,
                  padding: '3px 9px', borderRadius: 6,
                }}>
                  {movie.Metascore} <span style={{ fontWeight: 500, opacity: 0.8, fontSize: 10 }}>META</span>
                </div>
              )}
              {movie.Year && <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 13, padding: '3px 10px', borderRadius: 6 }}>{movie.Year}</span>}
              {movie.Runtime !== 'N/A' && <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{movie.Runtime}</span>}
              {movie.Rated !== 'N/A' && (
                <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>{movie.Rated}</span>
              )}
            </div>

            {movie.Plot && movie.Plot !== 'N/A' && (
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '60ch' }}>
                {movie.Plot}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 2 }}>
              <WatchlistButton movie={movie} />
              {tmdb?.trailerKey && <TrailerButton videoKey={tmdb.trailerKey} />}
              <Link
                href={`https://www.imdb.com/title/${movie.imdbID}/`}
                target="_blank" rel="noopener noreferrer"
                className="btn-ghost"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border2)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 700,
                  padding: '10px 18px', borderRadius: 'var(--radius)', textDecoration: 'none',
                }}
              >
                IMDb ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Collection/Saga banner */}
        {tmdb?.collection && tmdb.collection.parts && tmdb.collection.parts.length > 1 && (
          <div style={{
            marginTop: 40,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Parte de la saga
              </p>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{tmdb.collection.name}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{tmdb.collection.parts.length} películas</p>
            </div>
            <Link href={`/tmdb/collection/${tmdb.collection.id}`} className="btn-ghost" style={{
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
              color: 'var(--violet)', fontSize: 12, fontWeight: 700,
              padding: '8px 16px', borderRadius: 'var(--radius)', textDecoration: 'none', flexShrink: 0,
            }}>
              Ver saga completa →
            </Link>
          </div>
        )}

        {/* Details grid */}
        <div style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,300px)', gap: 48 }} className="detail-grid">

          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Sinopsis</p>
              <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.8, opacity: 0.9 }}>{movie.Plot}</p>
            </div>

            {tmdb && tmdb.cast.length > 0 && <CastSection cast={tmdb.cast} />}

            {movie.Awards && movie.Awards !== 'N/A' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14, padding: '18px 22px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🏆</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Premios</p>
                  <p style={{ color: 'var(--text)', fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>{movie.Awards}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Director', value: movie.Director },
                { label: 'Reparto', value: movie.Actors },
                { label: 'País / Idioma', value: movie.Language },
                { label: 'Estreno', value: movie.Released },
                { label: 'Recaudación', value: movie.BoxOffice !== 'N/A' ? movie.BoxOffice : null },
              ].filter(({ value }) => value && value !== 'N/A').map(({ label, value }, i, arr) => (
                <div key={label} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', padding: '14px 0' }}>
                  <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
                  <p style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.55, opacity: 0.9 }}>{value}</p>
                </div>
              ))}
            </div>

            {tmdb?.providers && (
              <WatchProvidersSection providers={tmdb.providers} tmdbLink={tmdb.providers.link} />
            )}
          </div>
        </div>

        <div style={{ height: 72 }} />
      </div>

      {/* Recommendations */}
      {recs.length > 0 && (
        <div style={{ paddingBottom: 72 }}>
          <TmdbCarousel items={recs} title="También te puede gustar" subtitle="Recomendaciones basadas en esta película" type="movie" />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
