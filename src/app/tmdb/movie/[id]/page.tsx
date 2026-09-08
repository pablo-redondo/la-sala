export const revalidate = 3600

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTmdbMovieDetail, getBackdropUrl, getPosterUrl } from '@/services/tmdb'
import { isTmdbId } from '@/lib/ids'
import CastSection from '@/components/CastSection'
import TmdbCarousel from '@/components/TmdbCarousel'
import WatchProvidersSection from '@/components/WatchProvidersSection'
import TrailerButton from '@/components/TrailerButton'
import TmdbWatchlistButton from '@/components/TmdbWatchlistButton'
import type { TmdbReleaseDateEntry } from '@/services/tmdb'

function pickTrailer(videos: { key: string; site: string; type: string; official: boolean }[]) {
  const yt = videos.filter(v => v.site === 'YouTube')
  return (yt.find(v => v.type === 'Trailer' && v.official) ?? yt.find(v => v.type === 'Trailer') ?? yt[0])?.key ?? null
}

function pickCertification(releaseDates: { results: { iso_3166_1: string; release_dates: TmdbReleaseDateEntry[] }[] } | undefined): string | null {
  if (!releaseDates?.results) return null
  const byCountry = (code: string) => {
    const country = releaseDates.results.find(r => r.iso_3166_1 === code)
    if (!country) return null
    const theatrical = country.release_dates.find(d => d.release_type === 3 && d.certification)
    const any = country.release_dates.find(d => d.certification)
    return (theatrical ?? any)?.certification ?? null
  }
  return byCountry('ES') ?? byCountry('US') ?? null
}

function MetaGrid({ items }: { items: { label: string; value: string | null }[] }) {
  const filtered = items.filter(x => x.value)
  if (!filtered.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {filtered.map(({ label, value }) => (
        <div key={label} style={{ background: 'var(--surface)', padding: '10px 16px', minWidth: 90, flex: '1 1 auto' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

export default async function TmdbMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isTmdbId(id)) notFound()

  const movie = await getTmdbMovieDetail(id)
  if (!movie) notFound()

  const poster = getPosterUrl(movie.poster_path, 'w500')
  const backdrop = getBackdropUrl(movie.backdrop_path, 'w1280')
  const trailerKey = pickTrailer(movie.videos?.results ?? [])
  const recs = (movie.recommendations?.results ?? []).filter(m => m.poster_path).slice(0, 14)
  const similar = (movie.similar?.results ?? []).filter(m => m.poster_path).slice(0, 14)
  const display = recs.length ? recs : similar

  const directors = (movie.credits?.crew ?? []).filter(c => c.job === 'Director').slice(0, 2)
  const writers = (movie.credits?.crew ?? []).filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job)).slice(0, 2)
  const cast = (movie.credits?.cast ?? []).slice(0, 16)

  const providers = movie['watch/providers']?.results?.['ES'] ?? movie['watch/providers']?.results?.['US'] ?? null
  const certification = pickCertification(movie.release_dates)

  const galleryBackdrops = (movie.images?.backdrops ?? [])
    .filter(b => b.vote_average > 0)
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 12)

  const companies = (movie.production_companies ?? []).filter(c => c.logo_path).slice(0, 8)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Cinematic backdrop */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        {(backdrop || poster) && (
          <Image src={backdrop ?? poster!} alt="" fill priority sizes="100vw"
            style={{ objectFit: 'cover', filter: 'brightness(0.3) saturate(1.2)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,11,8,0.1) 0%, rgba(13,11,8,0.55) 60%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, rgba(13,11,8,0.25) 50%, transparent 100%)' }} />
      </div>

      <div className="page-inner" style={{ marginTop: -420, position: 'relative', zIndex: 10 }}>

        <Link href="/discover" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, textDecoration: 'none', marginBottom: 20 }}>← Descubrir</Link>

        {/* Hero row */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }} className="hero-row">
          {poster && (
            <div style={{ flexShrink: 0, width: 'clamp(120px, 12vw, 190px)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 64px -8px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)' }}>
              <Image src={poster} alt={movie.title} width={190} height={285} style={{ width: '100%', display: 'block' }} priority />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
            {movie.genres?.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {movie.genres.slice(0, 4).map(g => (
                  <Link key={g.id} href={`/discover?genre=${g.id}&type=movie`} style={{ background: 'rgba(212,152,42,0.08)', border: '1px solid rgba(212,152,42,0.12)', color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4, textDecoration: 'none' }}>{g.name}</Link>
                ))}
              </div>
            )}

            {movie.tagline && (
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>&ldquo;{movie.tagline}&rdquo;</p>
            )}

            <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(52px, 8vw, 110px)', fontWeight: 400, color: '#fff', letterSpacing: '2px', lineHeight: 0.88 }}>
              {movie.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {movie.vote_average > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ color: 'var(--accent)', fontSize: 14 }}>★</span>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{movie.vote_average.toFixed(1)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>/10 · {movie.vote_count?.toLocaleString('es')} votos</span>
                </div>
              )}
              {movie.release_date && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{movie.release_date.slice(0, 4)}</span>}
              {movie.runtime && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>· {movie.runtime} min</span>}
              {certification && (
                <span style={{ background: 'rgba(212,152,42,0.08)', border: '1px solid rgba(212,152,42,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{certification}</span>
              )}
            </div>

            {movie.overview && (
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {movie.overview}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
              {trailerKey && <TrailerButton videoKey={trailerKey} />}
              <TmdbWatchlistButton tmdbId={movie.id} type="movie" title={movie.title} posterPath={movie.poster_path} year={movie.release_date?.slice(0, 4) ?? ''} rating={movie.vote_average > 0 ? movie.vote_average : null} />
              {movie.imdb_id && (
                <Link href={`https://www.imdb.com/title/${movie.imdb_id}/`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212,152,42,0.08)', border: '1px solid rgba(212,152,42,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, padding: '9px 16px', borderRadius: 8, textDecoration: 'none' }}>IMDb ↗</Link>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal meta grid */}
        <div style={{ marginTop: 24 }}>
          <MetaGrid items={[
            { label: 'Dirección', value: directors.map(d => d.name).join(', ') || null },
            { label: 'Guion', value: writers.map(w => w.name).join(', ') || null },
            { label: 'Estreno', value: movie.release_date || null },
            { label: 'Duración', value: movie.runtime ? `${movie.runtime} min` : null },
            { label: 'Clasificación', value: certification },
            { label: 'Presupuesto', value: movie.budget ? `$${(movie.budget / 1e6).toFixed(0)}M` : null },
            { label: 'Recaudación', value: movie.revenue ? `$${(movie.revenue / 1e6).toFixed(0)}M` : null },
            { label: 'Idiomas', value: movie.spoken_languages?.map(l => l.name).join(', ') || null },
          ]} />
        </div>

        {/* Where to watch — full width */}
        {providers && (
          <div style={{ marginTop: 16 }}>
            <WatchProvidersSection providers={providers} />
          </div>
        )}

        {/* Collection banner */}
        {movie.belongs_to_collection && (
          <Link href={`/tmdb/collection/${movie.belongs_to_collection.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 20px', textDecoration: 'none', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3, opacity: 0.7 }}>Parte de la saga</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{movie.belongs_to_collection.name}</p>
            </div>
            <span style={{ color: 'var(--muted2)', fontSize: 12, fontWeight: 600 }}>Ver saga →</span>
          </Link>
        )}

        {/* Gallery */}
        {galleryBackdrops.length > 1 && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Imágenes</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hide">
              {galleryBackdrops.map((img, i) => (
                <div key={i} style={{ flexShrink: 0, borderRadius: 8, overflow: 'hidden', position: 'relative', width: 'clamp(180px, 22vw, 300px)', aspectRatio: '16/9', background: 'var(--surface2)' }}>
                  <Image src={`https://image.tmdb.org/t/p/w780${img.file_path}`} alt="" fill sizes="300px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full-width content */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {movie.overview && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Sinopsis</p>
              <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.8, opacity: 0.85, maxWidth: '72ch' }}>{movie.overview}</p>
            </div>
          )}

          {(movie.keywords?.keywords?.length ?? 0) > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Temas</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {movie.keywords.keywords.slice(0, 20).map(kw => (
                  <Link key={kw.id} href={`/search?q=${encodeURIComponent(kw.name)}`} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 11, padding: '3px 10px', borderRadius: 4, textDecoration: 'none' }}>{kw.name}</Link>
                ))}
              </div>
            </div>
          )}

          {cast.length > 0 && <CastSection cast={cast} />}

          {(movie.reviews?.results?.length ?? 0) > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Reseñas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {movie.reviews.results.slice(0, 3).map(r => (
                  <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                        {r.author.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{r.author}</p>
                        <p style={{ fontSize: 10, color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</p>
                      </div>
                      {r.author_details?.rating != null && (
                        <span style={{ marginLeft: 'auto', background: 'var(--accent2)', border: '1px solid rgba(212,152,42,0.2)', color: 'var(--accent)', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>★ {r.author_details.rating}/10</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Production companies — horizontal row */}
          {companies.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Producción</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {companies.map(c => (
                  <div key={c.id} title={c.name} style={{ background: '#fff', borderRadius: 6, padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, width: 76, flexShrink: 0 }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <Image src={`https://image.tmdb.org/t/p/w185${c.logo_path}`} alt={c.name} fill sizes="76px" style={{ objectFit: 'contain' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 48 }} />
      </div>

      {display.length > 0 && (
        <div style={{ paddingBottom: 56 }}>
          <TmdbCarousel items={display} title="También te puede gustar" type="movie" />
        </div>
      )}

      <style>{`
        @media (max-width: 600px) { .hero-row { flex-direction: column; align-items: flex-start !important; } }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
