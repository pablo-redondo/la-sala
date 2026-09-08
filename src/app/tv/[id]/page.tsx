export const revalidate = 3600

import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getTVDetail } from '@/services/tv'
import { normalizePoster } from '@/lib/omdb'
import { getTVEnhancement, getBackdropUrl } from '@/services/tmdb'
import { isImdbId } from '@/lib/ids'
import WatchlistButton from '@/components/WatchlistButton'
import CastSection from '@/components/CastSection'
import TmdbCarousel from '@/components/TmdbCarousel'
import WatchProvidersSection from '@/components/WatchProvidersSection'
import TrailerButton from '@/components/TrailerButton'

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isImdbId(id)) notFound()

  const [show, tmdb] = await Promise.all([
    getTVDetail(id),
    getTVEnhancement(id),
  ])
  if (!show) {
    if (tmdb?.tmdbId) redirect(`/tmdb/tv/${tmdb.tmdbId}`)
    notFound()
  }

  const poster = normalizePoster(show.Poster)
  const backdropUrl = tmdb?.backdropUrl ?? null
  const genres = show.Genre !== 'N/A' ? show.Genre.split(', ') : []
  const ratingNum = parseFloat(show.imdbRating)
  const ratingPercent = show.imdbRating !== 'N/A' ? (ratingNum / 10) * 100 : null
  const recs = tmdb?.recommendations?.length ? tmdb.recommendations : tmdb?.similar ?? []

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

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

        <Link href="/tv" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
          textDecoration: 'none', marginBottom: 28,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
          padding: '6px 14px', borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>← Series</Link>

        <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {poster && (
            <div style={{
              flexShrink: 0, width: 'clamp(150px, 16vw, 240px)',
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 40px 100px -10px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
            }}>
              <Image src={poster} alt={show.Title} width={240} height={360} style={{ width: '100%', display: 'block' }} priority />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14, paddingTop: poster ? 8 : 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.4)',
                color: '#67e8f9', fontSize: 10, fontWeight: 800,
                padding: '4px 12px', borderRadius: 999, letterSpacing: '0.1em', textTransform: 'uppercase',
                backdropFilter: 'blur(8px)',
              }}>Serie</span>
              {genres.map(g => (
                <Link key={g} href={`/discover?genre_name=${encodeURIComponent(g)}&type=tv`} style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600,
                  padding: '4px 12px', borderRadius: 999, textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                }}>{g}</Link>
              ))}
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 54px)',
              fontWeight: 900, color: '#fff',
              letterSpacing: '-1.5px', lineHeight: 0.95,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}>
              {show.Title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {show.imdbRating !== 'N/A' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 20 }}>★</span>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 24 }}>{show.imdbRating}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>/10 IMDb</span>
                  </div>
                  {ratingPercent !== null && (
                    <div style={{ width: 52, height: 4, background: 'rgba(251,191,36,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${ratingPercent}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              )}
              {show.Year && <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 13, padding: '3px 10px', borderRadius: 6 }}>{show.Year}</span>}
              {show.totalSeasons && (
                <span style={{
                  background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)',
                  color: '#67e8f9', fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 8,
                }}>
                  {show.totalSeasons} temp.
                </span>
              )}
              {show.Runtime && show.Runtime !== 'N/A' && <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{show.Runtime}/ep</span>}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
              <WatchlistButton movie={show} />
              {tmdb?.trailerKey && <TrailerButton videoKey={tmdb.trailerKey} />}
              <Link
                href={`https://www.imdb.com/title/${show.imdbID}/`}
                target="_blank" rel="noopener noreferrer"
                className="btn-ghost"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border2)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 700,
                  padding: '10px 18px', borderRadius: 'var(--radius)', textDecoration: 'none',
                }}
              >IMDb ↗</Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 52, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,300px)', gap: 48 }} className="detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Sinopsis</p>
              <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.8, opacity: 0.9 }}>{show.Plot}</p>
            </div>

            {tmdb && tmdb.cast.length > 0 && <CastSection cast={tmdb.cast} />}

            {show.Awards && show.Awards !== 'N/A' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14, padding: '18px 22px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🏆</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Premios</p>
                  <p style={{ color: 'var(--text)', fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>{show.Awards}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Creador', value: show.Director !== 'N/A' ? show.Director : null },
                { label: 'Reparto', value: show.Actors },
                { label: 'Idioma', value: show.Language },
                { label: 'Estreno', value: show.Released },
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

      {recs.length > 0 && (
        <div style={{ paddingBottom: 72 }}>
          <TmdbCarousel items={recs} title="También te puede gustar" subtitle="Recomendaciones basadas en esta serie" type="tv" />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
