export const revalidate = 3600

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTmdbTVDetail, getBackdropUrl, getPosterUrl } from '@/services/tmdb'
import { isTmdbId } from '@/lib/ids'
import CastSection from '@/components/CastSection'
import TmdbCarousel from '@/components/TmdbCarousel'
import WatchProvidersSection from '@/components/WatchProvidersSection'
import TrailerButton from '@/components/TrailerButton'
import TmdbWatchlistButton from '@/components/TmdbWatchlistButton'

function pickTrailer(videos: { key: string; site: string; type: string; official: boolean }[]) {
  const yt = videos.filter(v => v.site === 'YouTube')
  return (yt.find(v => v.type === 'Trailer' && v.official) ?? yt.find(v => v.type === 'Trailer') ?? yt[0])?.key ?? null
}

function pickContentRating(contentRatings: { results: { iso_3166_1: string; rating: string }[] } | undefined): string | null {
  if (!contentRatings?.results) return null
  const es = contentRatings.results.find(r => r.iso_3166_1 === 'ES')?.rating
  const us = contentRatings.results.find(r => r.iso_3166_1 === 'US')?.rating
  return es ?? us ?? null
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

export default async function TmdbTVPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isTmdbId(id)) notFound()

  const show = await getTmdbTVDetail(id)
  if (!show) notFound()

  const poster = getPosterUrl(show.poster_path, 'w500')
  const backdrop = getBackdropUrl(show.backdrop_path, 'w1280')
  const trailerKey = pickTrailer(show.videos?.results ?? [])
  const recs = (show.recommendations?.results ?? []).filter(s => s.poster_path).slice(0, 14)
  const similar = (show.similar?.results ?? []).filter(s => s.poster_path).slice(0, 14)
  const display = recs.length ? recs : similar
  const cast = (show.credits?.cast ?? []).slice(0, 16)
  const providers = show['watch/providers']?.results?.['ES'] ?? show['watch/providers']?.results?.['US'] ?? null
  const contentRating = pickContentRating(show.content_ratings)
  const seasons = (show.seasons ?? []).filter(s => s.season_number > 0)
  const galleryBackdrops = (show.images?.backdrops ?? [])
    .filter(b => b.vote_average > 0)
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 10)
  const companies = (show.production_companies ?? []).filter(c => c.logo_path).slice(0, 8)
  const isEnded = show.status === 'Ended' || show.status === 'Canceled'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Cinematic backdrop */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        {(backdrop || poster) && (
          <Image src={backdrop ?? poster!} alt="" fill priority sizes="100vw"
            style={{ objectFit: 'cover', filter: 'brightness(0.3) saturate(1.2)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,7,13,0.1) 0%, rgba(8,7,13,0.55) 60%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, rgba(8,7,13,0.25) 50%, transparent 100%)' }} />
      </div>

      <div className="page-inner" style={{ marginTop: -420, position: 'relative', zIndex: 10 }}>

        <Link href="/tv" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, textDecoration: 'none', marginBottom: 20 }}>← Series</Link>

        {/* Hero row */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }} className="hero-row">
          {poster && (
            <div style={{ flexShrink: 0, width: 'clamp(120px, 12vw, 190px)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 64px -8px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06)' }}>
              <Image src={poster} alt={show.name} width={190} height={285} style={{ width: '100%', display: 'block' }} priority />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
            {show.genres?.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {show.genres.slice(0, 4).map(g => (
                  <Link key={g.id} href={`/discover?genre=${g.id}&type=tv`} className="pill-link" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.22)', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>{g.name}</Link>
                ))}
              </div>
            )}

            {show.tagline && (
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>&ldquo;{show.tagline}&rdquo;</p>
            )}

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6.5vw, 84px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 0.98 }}>
              {show.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {show.vote_average > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 14 }}>★</span>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{show.vote_average.toFixed(1)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>/10 · {show.vote_count?.toLocaleString('es')} votos</span>
                </div>
              )}
              {show.first_air_date && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{show.first_air_date.slice(0, 4)}</span>}
              {show.number_of_seasons > 0 && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>· {show.number_of_seasons} temp. · {show.number_of_episodes} ep.</span>}
              {contentRating && (
                <span style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{contentRating}</span>
              )}
              {show.status && (
                <span style={{ background: isEnded ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)', border: `1px solid ${isEnded ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, color: isEnded ? '#fca5a5' : '#86efac', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  {show.status === 'Ended' ? 'Finalizada' : show.status === 'Canceled' ? 'Cancelada' : 'En emisión'}
                </span>
              )}
            </div>

            {show.overview && (
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {show.overview}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
              {trailerKey && <TrailerButton videoKey={trailerKey} />}
              <TmdbWatchlistButton tmdbId={show.id} type="tv" title={show.name} posterPath={show.poster_path} year={show.first_air_date?.slice(0, 4) ?? ''} rating={show.vote_average > 0 ? show.vote_average : null} />
            </div>
          </div>
        </div>

        {/* Horizontal meta grid */}
        <div style={{ marginTop: 24 }}>
          <MetaGrid items={[
            { label: 'Red', value: show.networks?.map(n => n.name).join(', ') || null },
            { label: 'Estreno', value: show.first_air_date || null },
            { label: 'Último ep.', value: show.last_air_date || null },
            { label: 'Duración ep.', value: show.episode_run_time?.[0] ? `${show.episode_run_time[0]} min` : null },
            { label: 'Clasificación', value: contentRating },
            { label: 'Idioma orig.', value: show.original_name ?? null },
            { label: 'Idiomas', value: show.spoken_languages?.map(l => l.name).join(', ') || null },
          ]} />
        </div>

        {/* Where to watch — full width */}
        {providers && (
          <div style={{ marginTop: 16 }}>
            <WatchProvidersSection providers={providers} />
          </div>
        )}

        {/* Seasons */}
        {seasons.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Temporadas</p>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hide">
              {seasons.map(season => {
                const sp = getPosterUrl(season.poster_path, 'w185')
                return (
                  <Link key={season.id} href={`/tmdb/tv/${id}/temporada/${season.season_number}`} style={{ flexShrink: 0, width: 90, display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none' }} className="season-card">
                    <div style={{ borderRadius: 7, overflow: 'hidden', background: 'var(--surface2)', aspectRatio: '2/3', position: 'relative' }}>
                      {sp
                        ? <Image src={sp} alt={season.name} fill sizes="90px" style={{ objectFit: 'cover', transition: 'transform .4s ease' }} className="season-poster" />
                        : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 11 }}>T{season.season_number}</div>
                      }
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{season.name}</p>
                    <p style={{ fontSize: 9, color: 'var(--muted)' }}>{season.episode_count} ep{season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ''}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Gallery */}
        {galleryBackdrops.length > 1 && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Imágenes</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hide">
              {galleryBackdrops.map((img, i) => (
                <div key={i} className="gallery-thumb" style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', position: 'relative', width: 'clamp(180px, 22vw, 300px)', aspectRatio: '16/9', transition: 'transform .3s var(--ease-out), box-shadow .3s var(--ease-out)' }}>
                  <Image src={`https://image.tmdb.org/t/p/w780${img.file_path}`} alt="" fill sizes="300px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full-width content */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {show.overview && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Sinopsis</p>
              <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.8, opacity: 0.85, maxWidth: '72ch' }}>{show.overview}</p>
            </div>
          )}

          {(show.created_by?.length ?? 0) > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Creado por</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {show.created_by!.map(c => (
                  <span key={c.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 4 }}>{c.name}</span>
                ))}
              </div>
            </div>
          )}

          {(show.keywords?.results?.length ?? 0) > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Temas</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {show.keywords.results.slice(0, 20).map(kw => (
                  <Link key={kw.id} href={`/search?q=${encodeURIComponent(kw.name)}`} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 4, textDecoration: 'none' }}>{kw.name}</Link>
                ))}
              </div>
            </div>
          )}

          {cast.length > 0 && <CastSection cast={cast} />}

          {(show.reviews?.results?.length ?? 0) > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Reseñas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {show.reviews.results.slice(0, 3).map(r => (
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
                        <span style={{ marginLeft: 'auto', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: 'var(--gold)', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>★ {r.author_details.rating}/10</span>
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
          <TmdbCarousel items={display} title="También te puede gustar" type="tv" />
        </div>
      )}

      <style>{`
        @media (max-width: 600px) { .hero-row { flex-direction: column; align-items: flex-start !important; } }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .season-card:hover .season-poster { transform: scale(1.05); }
        .pill-link:hover { background: rgba(139,92,246,0.2) !important; border-color: rgba(139,92,246,0.4) !important; }
        .gallery-thumb:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.3); }
      `}</style>
    </div>
  )
}
